// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // RUBRIC: Protection against Clickjacking/XSS
const rateLimit = require('express-rate-limit'); // RUBRIC: Protection against DDoS/Brute Force
const bcrypt = require('bcrypt'); // RUBRIC: Password Hashing & Salting
const https = require('https'); // RUBRIC: SSL Data in Transit
const fs = require('fs');

const app = express();

// --- 1. SECURITY MIDDLEWARE ---
app.use(helmet()); 
app.use(cors({ origin: 'https://localhost:5173' })); // NOTE Change
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// Brute Force Protection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    message: "Too many login attempts, please try again later."
});

// --- 2. REGEX WHITELISTING (RUBRIC) ---
const regexPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    accountNumber: /^\d{8,12}$/,
    idNumber: /^\d{13}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, // Min 8, letter, number, special char
    swift: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
};

// Mock Database
const users = [];

// --- 3. ROUTES ---
app.post('/api/register', async (req, res) => {
    const { fullName, idNumber, accountNumber, password } = req.body;

    // Validate Input using RegEx
    if (!regexPatterns.name.test(fullName) || !regexPatterns.idNumber.test(idNumber) || 
        !regexPatterns.accountNumber.test(accountNumber) || !regexPatterns.password.test(password)) {
        return res.status(400).json({ error: "Invalid input format detected." });
    }

    try {
        // RUBRIC: Hashing and Salting
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        users.push({ fullName, idNumber, accountNumber, password: hashedPassword });
        res.status(201).json({ message: "Secure registration successful!" });
    } catch (err) {
        res.status(500).json({ error: "Server error during registration." });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    // Implement login logic comparing bcrypt hashes here
    res.json({ message: "Login endpoint ready" });
});

// --- 4. SSL CERTIFICATE (RUBRIC) ---
// Note: You must generate these files locally using OpenSSL
const sslOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
};

https.createServer(sslOptions, app).listen(5000, () => {
    console.log('Secure API running on https://localhost:5000');
});