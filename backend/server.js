require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';

// ─────────────────────────────────────────────
// 1. MIDDLEWARE & SECURITY HEADERS
// ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: 'https://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

// ─────────────────────────────────────────────
// 2. RATE LIMITERS
// ─────────────────────────────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: 'Too many accounts created. Please try again later.' }
});

// ─────────────────────────────────────────────
// 3. REGEX WHITELISTING PATTERNS
// ─────────────────────────────────────────────
const patterns = {
    name:          /^[a-zA-Z\s]{2,50}$/,
    username:      /^[a-zA-Z0-9_]{4,20}$/,
    idNumber:      /^\d{13}$/,
    accountNumber: /^\d{8,12}$/,
    password:      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    swiftCode:     /^[A-Z0-9]{8,11}$/,
    amount:        /^\d+(\.\d{1,2})?$/
};

// ─────────────────────────────────────────────
// 4. DATABASE SCHEMAS
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    fullName:      { type: String, required: true },
    username:      { type: String, required: true, unique: true },
    idNumber:      { type: String, required: true, unique: true },
    accountNumber: {
        type: String,
        unique: true,
        default: () => '8818' + Math.floor(100000 + Math.random() * 900000)
    },
    password:  { type: String, required: true },
    balance:   { type: Number, default: 50000.00 },
    role:      { type: String, default: 'customer' }
});

const paymentSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payeeName:    String,
    payeeAccount: String,
    amount:       Number,
    currency:     { type: String, default: 'ZAR' },
    swiftCode:    String,
    status:       { type: String, default: 'Pending' },
    createdAt:    { type: Date, default: Date.now }
});

const User    = mongoose.model('User', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// ─────────────────────────────────────────────
// 5. JWT AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided. Please log in.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = decoded; // attach decoded payload to request
        next();
    });
};

// ─────────────────────────────────────────────
// 6. DATABASE CONNECTION
// ─────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ DB connection error:', err));

// ─────────────────────────────────────────────
// 7. ROUTES
// ─────────────────────────────────────────────

// REGISTER — customers only
app.post('/api/register', registerLimiter, async (req, res) => {
    const { fullName, username, idNumber, accountNumber, password } = req.body;

    // Whitelist every field
    if (!patterns.name.test(fullName))
        return res.status(400).json({ error: 'Full name: letters only, 2–50 characters.' });
    if (!patterns.username.test(username))
        return res.status(400).json({ error: 'Username: 4–20 alphanumeric characters or underscores.' });
    if (!patterns.idNumber.test(idNumber))
        return res.status(400).json({ error: 'ID number must be exactly 13 digits.' });
    if (!patterns.password.test(password))
        return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, number, and special character.' });

    try {
        const salt           = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            idNumber,
            accountNumber: accountNumber || undefined,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({
            message: 'Registration successful!',
            accountNumber: newUser.accountNumber
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Account already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// LOGIN — returns JWT token
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // Whitelist check
    if (!patterns.username.test(username) || !patterns.accountNumber.test(accountNumber)) {
        return res.status(400).json({ error: 'Invalid input format.' });
    }

    try {
        // Match by both username AND account number (extra security layer)
        const user = await User.findOne({ username, accountNumber });
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

        // Sign a JWT valid for 1 hour
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id:            user._id,
                fullName:      user.fullName,
                accountNumber: user.accountNumber,
                balance:       user.balance
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// MAKE PAYMENT — protected by JWT
app.post('/api/pay', authenticateToken, async (req, res) => {
    const { userId, amount, currency, payeeName, payeeAccount, swiftCode } = req.body;

    // Extra: ensure the token's user matches the requested userId (prevent IDOR)
    if (req.user.id.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Unauthorised payment attempt.' });
    }

    // Whitelist payment fields
    if (!patterns.amount.test(String(amount)))
        return res.status(400).json({ error: 'Invalid amount format.' });
    if (!patterns.name.test(payeeName))
        return res.status(400).json({ error: 'Invalid payee name.' });
    if (!patterns.accountNumber.test(payeeAccount))
        return res.status(400).json({ error: 'Invalid payee account number.' });
    if (!patterns.swiftCode.test(swiftCode))
        return res.status(400).json({ error: 'Invalid SWIFT code.' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.balance < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient funds.' });
        }

        // Deduct balance
        user.balance -= parseFloat(amount);
        await user.save();

        // Create payment record
        const payment = new Payment({
            userId,
            amount: parseFloat(amount),
            currency,
            payeeName,
            payeeAccount,
            swiftCode
        });
        await payment.save();

        res.status(201).json({
            message:       'Payment submitted successfully.',
            newBalance:    user.balance,
            transactionId: payment._id
        });
    } catch (err) {
        res.status(500).json({ error: 'Payment processing failed.' });
    }
});

// GET TRANSACTION HISTORY — protected by JWT
app.get('/api/transactions/:userId', authenticateToken, async (req, res) => {
    // Ensure the requesting user can only see their own transactions
    if (req.user.id.toString() !== req.params.userId.toString()) {
        return res.status(403).json({ error: 'Unauthorised.' });
    }

    try {
        const history = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch transaction history.' });
    }
});

// GET ALL PAYMENTS (for Employee Portal in Task 3 — employees only)
app.get('/api/all-payments', authenticateToken, async (req, res) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ error: 'Access restricted to bank employees.' });
    }
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).populate('userId', 'fullName accountNumber');
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch payments.' });
    }
});

// ─────────────────────────────────────────────
// 8. HTTPS SERVER
// ─────────────────────────────────────────────
const sslOptions = {
    key:  fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
};

https.createServer(sslOptions, app).listen(5000, () => {
    console.log('🔒 Secure API running on https://localhost:5000');
});