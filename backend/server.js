require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();

// --- 1. MIDDLEWARE & SECURITY ---
app.use(helmet()); 
app.use(cors({ origin: 'https://localhost:5173' })); 
app.use(express.json({ limit: '10kb' })); 

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later."
});

// --- 2. DATABASE SCHEMAS ---
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 50000.00 }
});

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payeeName: String,
    payeeAccount: String,
    amount: Number,
    swiftCode: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Securely connected to MongoDB Atlas"))
  .catch(err => console.error("Database connection error:", err));

// --- 4. REGEX PATTERNS (Whitelisting) ---
const regexPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    accountNumber: /^\d{8,12}$/,
    idNumber: /^\d{13}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    swift: /^[A-Z0-9]{8,11}$/
};

// --- 5. ROUTES ---

// REGISTER
app.post('/api/register', async (req, res) => {
    const { fullName, idNumber, accountNumber, password } = req.body;

    if (!regexPatterns.name.test(fullName) || !regexPatterns.idNumber.test(idNumber) || 
        !regexPatterns.accountNumber.test(accountNumber) || !regexPatterns.password.test(password)) {
        return res.status(400).json({ error: "Invalid input format detected." });
    }

    try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ fullName, idNumber, accountNumber, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ error: "User already exists or server error." });
    }
});

// LOGIN
app.post('/api/login', loginLimiter, async (req, res) => {
    const { accountNumber, password } = req.body;

    try {
        const user = await User.findOne({ accountNumber });
        if (!user) return res.status(401).json({ error: "Invalid credentials." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

        res.json({ 
            message: "Login successful", 
            user: { id: user._id, fullName: user.fullName, balance: user.balance } 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during login." });
    }
});

// MAKE PAYMENT
app.post('/api/pay', async (req, res) => {
    const { userId, amount, payeeName, payeeAccount, swiftCode } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || user.balance < amount) {
            return res.status(400).json({ error: "Insufficient funds or invalid user." });
        }

        user.balance -= amount;
        await user.save();

        const payment = new Payment({ userId, amount, payeeName, payeeAccount, swiftCode });
        await payment.save();

        res.status(201).json({ message: "Payment submitted for verification", newBalance: user.balance });
    } catch (err) {
        res.status(500).json({ error: "Payment processing failed." });
    }
});

// --- 6. SSL SERVER ---
const sslOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
};

https.createServer(sslOptions, app).listen(5000, () => {
    console.log('Secure API running on https://localhost:5000');
});