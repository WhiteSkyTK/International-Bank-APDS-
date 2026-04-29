require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const https     = require('https');
const fs        = require('fs');
const mongoose  = require('mongoose');

const app        = express();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';

// ─────────────────────────────────────────────
// 1. MIDDLEWARE & SECURITY HEADERS
// ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: 'https://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

// ─────────────────────────────────────────────
// 2. RATE LIMITERS
// ─────────────────────────────────────────────
const loginLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,  message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many registrations. Try again later.' } });

// ─────────────────────────────────────────────
// 3. REGEX WHITELISTING
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
// 4. SCHEMAS
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    fullName:      { type: String, required: true },
    username:      { type: String, required: true, unique: true },
    idNumber:      { type: String, required: true, unique: true },
    accountNumber: {
        type: String, unique: true,
        default: () => '8818' + Math.floor(100000 + Math.random() * 900000)
    },
    password:  { type: String,  required: true },
    balance:   { type: Number,  default: 50000.00 },
    role:      { type: String,  default: 'customer' }
});

const paymentSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payeeName:    String,
    payeeAccount: String,
    amount:       Number,
    currency:     { type: String, default: 'ZAR' },
    swiftCode:    String,
    status:       { type: String, default: 'Pending' },
    createdAt:    { type: Date,   default: Date.now }
});

const notificationSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    icon:      { type: String, default: '🔔' },
    title:     { type: String, required: true },
    body:      { type: String, required: true },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date,   default: Date.now }
});

const User         = mongoose.model('User',         userSchema);
const Payment      = mongoose.model('Payment',      paymentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// ─────────────────────────────────────────────
// 5. JWT MIDDLEWARE
// ─────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const auth  = req.headers['authorization'];
    const token = auth && auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = decoded;
        next();
    });
};

const employeeOnly = (req, res, next) => {
    if (req.user?.role !== 'employee')
        return res.status(403).json({ error: 'Access restricted to bank employees.' });
    next();
};

// ─────────────────────────────────────────────
// 6. DB CONNECTION
// ─────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas connected'))
    .catch((err) => console.error('❌ DB error:', err));

// ─────────────────────────────────────────────
// 7. HELPER — create a notification for a user
// ─────────────────────────────────────────────
const createNotification = async (userId, icon, title, body) => {
    try {
        await new Notification({ userId, icon, title, body }).save();
    } catch (e) {
        console.error('Notification save error:', e);
    }
};

// ─────────────────────────────────────────────
// 8. AUTH ROUTES
// ─────────────────────────────────────────────
app.post('/api/register', registerLimiter, async (req, res) => {
    const { fullName, username, idNumber, accountNumber, password } = req.body;

    if (!patterns.name.test(fullName))
        return res.status(400).json({ error: 'Full name: letters only, 2–50 chars.' });
    if (!patterns.username.test(username))
        return res.status(400).json({ error: 'Username: 4–20 alphanumeric / underscore.' });
    if (!patterns.idNumber.test(idNumber))
        return res.status(400).json({ error: 'ID number must be exactly 13 digits.' });
    if (!patterns.password.test(password))
        return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, number and special character.' });

    try {
        const salt   = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, username, idNumber,
            accountNumber: accountNumber || undefined,
            password: hashed
        });
        await newUser.save();

        // Welcome notification
        await createNotification(
            newUser._id, '🎉',
            'Welcome to GlobalPay!',
            `Hi ${fullName.split(' ')[0]}, your account has been created successfully.`
        );

        res.status(201).json({ message: 'Registration successful!', accountNumber: newUser.accountNumber });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Account already exists.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, accountNumber, password } = req.body;

    if (!patterns.username.test(username) || !patterns.accountNumber.test(accountNumber))
        return res.status(400).json({ error: 'Invalid input format.' });

    try {
        const user = await User.findOne({ username, accountNumber });
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

        // Login notification
        await createNotification(
            user._id, '🔐',
            'New Login Detected',
            `A new session started at ${new Date().toLocaleString('en-ZA')}.`
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id:            user._id,
                fullName:      user.fullName,
                username:      user.username,
                idNumber:      user.idNumber,
                accountNumber: user.accountNumber,
                balance:       user.balance,
                role:          user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// 9. PAYMENT ROUTES
// ─────────────────────────────────────────────
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                  // max 30 payment attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many payment requests. Please try again later.' }
});

app.post('/api/pay', paymentLimiter, authenticate, async (req, res) => {
    // IDOR check: token user must match the request userId
    if (req.user.id.toString() !== req.body.userId?.toString())
        return res.status(403).json({ error: 'Unauthorised payment attempt.' });

    const { userId, amount, currency, payeeName, payeeAccount, swiftCode } = req.body;

    if (!patterns.amount.test(String(amount)))
        return res.status(400).json({ error: 'Invalid amount.' });
    if (!patterns.name.test(payeeName))
        return res.status(400).json({ error: 'Invalid payee name.' });
    if (!patterns.accountNumber.test(payeeAccount))
        return res.status(400).json({ error: 'Invalid payee account number.' });
    if (!patterns.swiftCode.test(swiftCode))
        return res.status(400).json({ error: 'Invalid SWIFT code.' });

    // NOTE: Paying to your own account number is intentionally ALLOWED —
    // users may legitimately transfer to their own foreign accounts.

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.balance < parseFloat(amount))
            return res.status(400).json({ error: 'Insufficient funds.' });

        user.balance -= parseFloat(amount);
        await user.save();

        const payment = new Payment({ userId, amount: parseFloat(amount), currency, payeeName, payeeAccount, swiftCode });
        await payment.save();

        // Payment notification
        await createNotification(
            userId, '✅',
            'Payment Submitted',
            `R${parseFloat(amount).toFixed(2)} to ${payeeName} (${swiftCode}) is queued for processing.`
        );

        res.status(201).json({ message: 'Payment submitted.', newBalance: user.balance, transactionId: payment._id });
    } catch (err) {
        res.status(500).json({ error: 'Payment processing failed.' });
    }
});

app.get('/api/transactions/:userId', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId)
        return res.status(403).json({ error: 'Unauthorised.' });
    try {
        const history = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch {
        res.status(500).json({ error: 'Could not fetch transactions.' });
    }
});

// Employee — all payments
app.get('/api/all-payments', authenticate, employeeOnly, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).populate('userId', 'fullName accountNumber');
        res.json(payments);
    } catch {
        res.status(500).json({ error: 'Could not fetch payments.' });
    }
});

// Employee — verify payment
app.patch('/api/payments/:id/verify', authenticate, employeeOnly, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'Verified' }, { new: true });
        if (!payment) return res.status(404).json({ error: 'Payment not found.' });

        // Notify the customer
        await createNotification(
            payment.userId, '🏦',
            'Payment Verified',
            `Your transfer of ${payment.currency || 'R'}${payment.amount.toFixed(2)} to ${payment.payeeName} has been verified and submitted to SWIFT.`
        );

        res.json({ message: 'Payment verified.', payment });
    } catch {
        res.status(500).json({ error: 'Could not verify payment.' });
    }
});

// ─────────────────────────────────────────────
// 10. NOTIFICATION ROUTES
// ─────────────────────────────────────────────

// Get notifications for a user (newest first)
app.get('/api/notifications/:userId', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId)
        return res.status(403).json({ error: 'Unauthorised.' });
    try {
        const notifs = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifs);
    } catch {
        res.status(500).json({ error: 'Could not fetch notifications.' });
    }
});

// Mark all read
app.patch('/api/notifications/:userId/read-all', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId)
        return res.status(403).json({ error: 'Unauthorised.' });
    try {
        await Notification.updateMany({ userId: req.params.userId }, { read: true });
        res.json({ message: 'All notifications marked as read.' });
    } catch {
        res.status(500).json({ error: 'Failed to update notifications.' });
    }
});

// Dismiss (delete) a single notification
app.delete('/api/notifications/:id', authenticate, async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ error: 'Not found.' });
        if (notif.userId.toString() !== req.user.id.toString())
            return res.status(403).json({ error: 'Unauthorised.' });
        await notif.deleteOne();
        res.json({ message: 'Notification dismissed.' });
    } catch {
        res.status(500).json({ error: 'Could not delete notification.' });
    }
});

// ─────────────────────────────────────────────
// 11. HTTPS SERVER
// ─────────────────────────────────────────────
const sslOptions = {
    key:  fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
};

https.createServer(sslOptions, app).listen(5000, () => {
    console.log('🔒 Secure API running on https://localhost:5000');
});