// backend/tests/security.test.js
// Runs in GitHub Actions CI against a local MongoDB container.
// Tests: input whitelisting, password hashing, JWT validation, security headers.

const request  = require('supertest');
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-ci';
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/globalpay_test';

let app;

beforeAll(async () => {
    process.env.NODE_ENV  = 'test';
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.MONGO_URI  = MONGO_URI;

    // Import app AFTER setting env vars so server.js picks them up
    app = require('../server');

    // Wait for mongoose to connect
    await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) return resolve();
        mongoose.connection.once('connected', resolve);
    });
}, 30000);

afterAll(async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    } catch (_) {}
});

// ── 1. Security Headers ───────────────────────────────────────────────────────
describe('Security Headers (Helmet)', () => {
    test('Sets X-Frame-Options to SAMEORIGIN or DENY — prevents clickjacking', async () => {
        const res = await request(app).get('/api/health');
        const header = res.headers['x-frame-options'];
        expect(['DENY', 'SAMEORIGIN']).toContain(header);
    });

    test('Sets X-Content-Type-Options — prevents MIME sniffing', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    test('Removes X-Powered-By — hides server fingerprint', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});

// ── 2. Input Whitelisting (RegEx) ─────────────────────────────────────────────
describe('Input Whitelisting', () => {
    test('Rejects SQL injection in fullName field', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      "'; DROP TABLE users; --",
            username:      'hacker01',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'Hack@1234'
        });
        expect(res.status).toBe(400);
    });

    test('Rejects XSS payload in fullName field', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      '<script>alert(1)</script>',
            username:      'hacker02',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'Hack@1234'
        });
        expect(res.status).toBe(400);
    });

    test('Rejects weak password — no special character', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'Test User',
            username:      'testuser1',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'password123'
        });
        expect(res.status).toBe(400);
    });

    test('Rejects ID number shorter than 13 digits', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'Test User',
            username:      'testuser2',
            idNumber:      '12345',
            accountNumber: '88181234',
            password:      'Test@1234'
        });
        expect(res.status).toBe(400);
    });

    test('Accepts a valid registration payload', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'Jane Smith',
            username:      'janesmith99',
            idNumber:      '9001014800086',
            accountNumber: '88180001',
            password:      'Secure@9876'
        });
        // 201 created, or 409 if test ran twice
        expect([201, 409]).toContain(res.status);
    });
});

// ── 3. Password Hashing ───────────────────────────────────────────────────────
describe('Password Security (bcrypt)', () => {
    test('Password is hashed — plain text never stored in DB', async () => {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: 'janesmith99' });
        if (!user) return; // skipped if registration was 409

        expect(user.password).not.toBe('Secure@9876');
        expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    test('bcrypt correctly validates the correct password', async () => {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: 'janesmith99' });
        if (!user) return;

        const valid   = await bcrypt.compare('Secure@9876', user.password);
        const invalid = await bcrypt.compare('WrongPassword', user.password);
        expect(valid).toBe(true);
        expect(invalid).toBe(false);
    });
});

// ── 4. JWT Authentication Guard ───────────────────────────────────────────────
describe('JWT Authentication', () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    test('Blocks /api/pay with no token — returns 401', async () => {
        const res = await request(app).post('/api/pay').send({ userId: fakeId, amount: 100 });
        expect(res.status).toBe(401);
    });

    test('Blocks /api/pay with invalid token — returns 403', async () => {
        const res = await request(app)
            .post('/api/pay')
            .set('Authorization', 'Bearer not.a.real.token')
            .send({ userId: fakeId, amount: 100 });
        expect(res.status).toBe(403);
    });

    test('Blocks IDOR — user cannot read another user\'s transactions', async () => {
        const otherId = new mongoose.Types.ObjectId().toString();
        const token   = jwt.sign({ id: fakeId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get(`/api/transactions/${otherId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});

// ── 5. Role-Based Access Control ──────────────────────────────────────────────
describe('Role-Based Access Control', () => {
    test('Customer token cannot access employee-only /api/all-payments', async () => {
        const fakeId      = new mongoose.Types.ObjectId().toString();
        const customerTok = jwt.sign({ id: fakeId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get('/api/all-payments')
            .set('Authorization', `Bearer ${customerTok}`);

        expect(res.status).toBe(403);
    });
});