// backend/server.js — COMPLETE FILE
// Add the Employee schema + employee routes to your existing server.js.
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTIONS: Paste this ENTIRE file over your existing backend/server.js

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

// ── 1. MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: ['https://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

// ── 2. RATE LIMITERS ──────────────────────────────────────────────────────────
const loginLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,  message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many requests.' } });

// ── 3. REGEX WHITELIST ────────────────────────────────────────────────────────
const patterns = {
    name:          /^[a-zA-Z\s]{2,50}$/,
    username:      /^[a-zA-Z0-9_.]{4,20}$/,
    idNumber:      /^\d{13}$/,
    accountNumber: /^\d{8,12}$/,
    password:      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    swiftCode:     /^[A-Z0-9]{8,11}$/,
    amount:        /^\d+(\.\d{1,2})?$/,
    employeeId:    /^EMP\d{3,6}$/
};

// ── 4. SCHEMAS ────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    fullName:      { type: String, required: true },
    username:      { type: String, required: true, unique: true },
    idNumber:      { type: String, required: true, unique: true },
    accountNumber: { type: String, unique: true, default: () => '8818' + Math.floor(100000 + Math.random() * 900000) },
    password:      { type: String, required: true },
    balance:       { type: Number, default: 50000.00 },
    role:          { type: String, default: 'customer' }
});

const employeeSchema = new mongoose.Schema({
    fullName:   { type: String, required: true },
    username:   { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    role:       { type: String, default: 'employee' },
    createdAt:  { type: Date,   default: Date.now }
});

const paymentSchema = new mongoose.Schema({
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payeeName:      String,
    payeeAccount:   String,
    amount:         Number,
    currency:       { type: String, default: 'ZAR' },
    swiftCode:      String,
    status:         { type: String, default: 'Pending' },
    verifiedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    submittedSwift: { type: Boolean, default: false },
    createdAt:      { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    icon:      { type: String, default: '🔔' },
    title:     { type: String, required: true },
    body:      { type: String, required: true },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User         = mongoose.model('User',         userSchema);
const Employee     = mongoose.model('Employee',     employeeSchema);
const Payment      = mongoose.model('Payment',      paymentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// ── 5. JWT MIDDLEWARE ─────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = decoded;
        next();
    });
};

const employeeOnly = (req, res, next) => {
    if (req.user?.role !== 'employee') return res.status(403).json({ error: 'Employee access only.' });
    next();
};

// ── 6. DB CONNECTION ──────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ DB error:', err));

// ── 7. HELPERS ────────────────────────────────────────────────────────────────
const notify = async (userId, icon, title, body) => {
    try { await new Notification({ userId, icon, title, body }).save(); } catch (_) {}
};

// ── 8. HEALTH ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 9. CUSTOMER AUTH ──────────────────────────────────────────────────────────
app.post('/api/register', registerLimiter, async (req, res) => {
    const { fullName, username, idNumber, accountNumber, password } = req.body;
    if (!patterns.name.test(fullName))     return res.status(400).json({ error: 'Invalid full name.' });
    if (!patterns.username.test(username)) return res.status(400).json({ error: 'Invalid username.' });
    if (!patterns.idNumber.test(idNumber)) return res.status(400).json({ error: 'ID must be 13 digits.' });
    if (!patterns.password.test(password)) return res.status(400).json({ error: 'Password too weak.' });
    try {
        const hashed  = await bcrypt.hash(password, await bcrypt.genSalt(12));
        const newUser = new User({ fullName, username, idNumber, accountNumber: accountNumber || undefined, password: hashed });
        await newUser.save();
        await notify(newUser._id, '🎉', 'Welcome to GlobalPay!', `Hi ${fullName.split(' ')[0]}, your account is ready.`);
        res.status(201).json({ message: 'Registration successful!', accountNumber: newUser.accountNumber });
    } catch (err) {
        res.status(err.code === 11000 ? 409 : 500).json({ error: err.code === 11000 ? 'Account already exists.' : 'Server error.' });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, accountNumber, password } = req.body;
    if (!patterns.username.test(username) || !patterns.accountNumber.test(accountNumber))
        return res.status(400).json({ error: 'Invalid input.' });
    try {
        const user = await User.findOne({ username, accountNumber });
        if (!user || !await bcrypt.compare(password, user.password))
            return res.status(401).json({ error: 'Invalid credentials.' });
        const token = jwt.sign({ id: user._id, role: 'customer' }, JWT_SECRET, { expiresIn: '2h' });
        await notify(user._id, '🔐', 'New Login', `Session started at ${new Date().toLocaleString('en-ZA')}.`);
        res.json({ token, user: { id: user._id, fullName: user.fullName, username: user.username, idNumber: user.idNumber, accountNumber: user.accountNumber, balance: user.balance } });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// ── 10. EMPLOYEE AUTH ─────────────────────────────────────────────────────────
// NOTE: No registration endpoint exists for employees — accounts are pre-seeded via seed.js
app.post('/api/employee/login', loginLimiter, async (req, res) => {
    const { username, employeeId, password } = req.body;

    // Whitelist check
    if (!patterns.username.test(username))   return res.status(400).json({ error: 'Invalid username format.' });
    if (!patterns.employeeId.test(employeeId)) return res.status(400).json({ error: 'Invalid employee ID format.' });

    try {
        const emp = await Employee.findOne({ username, employeeId });
        if (!emp || !await bcrypt.compare(password, emp.password))
            return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign({ id: emp._id, role: 'employee', employeeId: emp.employeeId }, JWT_SECRET, { expiresIn: '8h' });
        res.json({
            token,
            employee: { id: emp._id, fullName: emp.fullName, username: emp.username, employeeId: emp.employeeId, role: 'employee' }
        });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// ── 11. CUSTOMER PAYMENT ROUTES ───────────────────────────────────────────────
app.post('/api/pay', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.body.userId?.toString())
        return res.status(403).json({ error: 'Unauthorised.' });
    const { userId, amount, currency, payeeName, payeeAccount, swiftCode } = req.body;
    if (!patterns.amount.test(String(amount)))     return res.status(400).json({ error: 'Invalid amount.' });
    if (!patterns.name.test(payeeName))            return res.status(400).json({ error: 'Invalid payee name.' });
    if (!patterns.accountNumber.test(payeeAccount)) return res.status(400).json({ error: 'Invalid payee account.' });
    if (!patterns.swiftCode.test(swiftCode))       return res.status(400).json({ error: 'Invalid SWIFT code.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.balance < parseFloat(amount)) return res.status(400).json({ error: 'Insufficient funds.' });
        user.balance -= parseFloat(amount);
        await user.save();
        const payment = await new Payment({ userId, amount: parseFloat(amount), currency, payeeName, payeeAccount, swiftCode }).save();
        await notify(userId, '✅', 'Payment Submitted', `R${parseFloat(amount).toFixed(2)} to ${payeeName} queued.`);
        res.status(201).json({ message: 'Payment submitted.', newBalance: user.balance, transactionId: payment._id });
    } catch { res.status(500).json({ error: 'Payment failed.' }); }
});

app.get('/api/transactions/:userId', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId)
        return res.status(403).json({ error: 'Unauthorised.' });
    try {
        const history = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch { res.status(500).json({ error: 'Could not fetch.' }); }
});

// ── 12. EMPLOYEE PAYMENT ROUTES ───────────────────────────────────────────────

// Get ALL payments (employee dashboard)
app.get('/api/employee/payments', authenticate, employeeOnly, async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName accountNumber');
        res.json(payments);
    } catch { res.status(500).json({ error: 'Could not fetch payments.' }); }
});

// Verify a single payment
app.patch('/api/employee/payments/:id/verify', authenticate, employeeOnly, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: 'Verified', verifiedBy: req.user.id },
            { new: true }
        ).populate('userId', 'fullName accountNumber');

        if (!payment) return res.status(404).json({ error: 'Payment not found.' });

        // Notify the customer their payment was verified
        await notify(
            payment.userId._id, '🏦',
            'Payment Verified',
            `Your transfer of ${payment.currency} ${payment.amount.toFixed(2)} to ${payment.payeeName} has been verified.`
        );
        res.json({ message: 'Payment verified.', payment });
    } catch { res.status(500).json({ error: 'Could not verify.' }); }
});

// Reject a single payment
app.patch('/api/employee/payments/:id/reject', authenticate, employeeOnly, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: 'Rejected', verifiedBy: req.user.id },
            { new: true }
        ).populate('userId', 'fullName accountNumber');

        if (!payment) return res.status(404).json({ error: 'Payment not found.' });

        // Refund the customer
        await User.findByIdAndUpdate(payment.userId._id, { $inc: { balance: payment.amount } });

        await notify(
            payment.userId._id, '❌',
            'Payment Rejected',
            `Your transfer of ${payment.currency} ${payment.amount.toFixed(2)} to ${payment.payeeName} was rejected. Your balance has been refunded.`
        );
        res.json({ message: 'Payment rejected and customer refunded.', payment });
    } catch { res.status(500).json({ error: 'Could not reject.' }); }
});

// Submit all verified payments to SWIFT
app.post('/api/employee/submit-swift', authenticate, employeeOnly, async (req, res) => {
    try {
        const verified = await Payment.find({ status: 'Verified', submittedSwift: false })
            .populate('userId', 'fullName accountNumber');

        if (verified.length === 0)
            return res.status(400).json({ error: 'No verified payments to submit.' });

        // Mark all as submitted
        const ids = verified.map((p) => p._id);
        await Payment.updateMany({ _id: { $in: ids } }, { submittedSwift: true, status: 'Submitted to SWIFT' });

        // Notify each customer
        for (const p of verified) {
            await notify(
                p.userId._id, '🚀',
                'Payment Sent to SWIFT',
                `Your transfer of ${p.currency} ${p.amount.toFixed(2)} to ${p.payeeName} has been submitted to the SWIFT network.`
            );
        }

        res.json({ message: `${verified.length} payment(s) submitted to SWIFT.`, count: verified.length });
    } catch { res.status(500).json({ error: 'SWIFT submission failed.' }); }
});

// ── 13. NOTIFICATION ROUTES ───────────────────────────────────────────────────
app.get('/api/notifications/:userId', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId) return res.status(403).json({ error: 'Unauthorised.' });
    try {
        const notifs = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifs);
    } catch { res.status(500).json({ error: 'Could not fetch.' }); }
});

app.patch('/api/notifications/:userId/read-all', authenticate, async (req, res) => {
    if (req.user.id.toString() !== req.params.userId) return res.status(403).json({ error: 'Unauthorised.' });
    try {
        await Notification.updateMany({ userId: req.params.userId }, { read: true });
        res.json({ message: 'All read.' });
    } catch { res.status(500).json({ error: 'Failed.' }); }
});

app.delete('/api/notifications/:id', authenticate, async (req, res) => {
    try {
        const n = await Notification.findById(req.params.id);
        if (!n) return res.status(404).json({ error: 'Not found.' });
        if (n.userId.toString() !== req.user.id.toString()) return res.status(403).json({ error: 'Unauthorised.' });
        await n.deleteOne();
        res.json({ message: 'Dismissed.' });
    } catch { res.status(500).json({ error: 'Failed.' }); }
});

// ── 14. START SERVER ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'test') {
    module.exports = app;
} else {
    const sslOptions = {
        key:  fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.cert')
    };
    https.createServer(sslOptions, app).listen(5000, () => {
        console.log('🔒 Secure API running on https://localhost:5000');
    });
}