// backend/tests/security.test.js
// Run with: npm test
// Tests that the pipeline checks on every push:
//   1. Security headers (Helmet)
//   2. Rate limiting (express-rate-limit)
//   3. Input validation / whitelisting (RegEx)
//   4. JWT authentication guard
//   5. Password hashing (bcrypt)
//   6. IDOR protection

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');

// ── Test app setup (same server, no https for testing) ───────────────────────
// We export the express `app` from server without starting the https listener.
// Add `module.exports = app;` at the bottom of server.js (guarded by NODE_ENV).

let app;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-ci-only';

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = JWT_SECRET;
    app = require('../server');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/globalpay_test');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS (Helmet)
// ─────────────────────────────────────────────────────────────────────────────
describe('Security Headers', () => {
    test('X-Frame-Options header is set to DENY (clickjacking protection)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-frame-options']).toBe('DENY');
    });

    test('X-Content-Type-Options header is set (MIME sniffing protection)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    test('Strict-Transport-Security header is present (HSTS)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['strict-transport-security']).toBeDefined();
    });

    test('X-Powered-By header is removed (server fingerprinting protection)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. INPUT VALIDATION / WHITELISTING
// ─────────────────────────────────────────────────────────────────────────────
describe('Input Whitelisting (RegEx)', () => {
    test('Rejects registration with SQL injection in fullName', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      "'; DROP TABLE users; --",
            username:      'testuser',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'Test@1234'
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('Rejects registration with XSS payload in fullName', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      '<script>alert("xss")</script>',
            username:      'testuser',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'Test@1234'
        });
        expect(res.status).toBe(400);
    });

    test('Rejects registration with a weak password (no special char)', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'John Smith',
            username:      'jsmith',
            idNumber:      '0001014800086',
            accountNumber: '88181234',
            password:      'password123'    // no special character
        });
        expect(res.status).toBe(400);
    });

    test('Rejects registration with ID number shorter than 13 digits', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'John Smith',
            username:      'jsmith',
            idNumber:      '12345',          // too short
            accountNumber: '88181234',
            password:      'Test@1234'
        });
        expect(res.status).toBe(400);
    });

    test('Accepts valid registration payload', async () => {
        const res = await request(app).post('/api/register').send({
            fullName:      'Test User',
            username:      'testuser99',
            idNumber:      '9001014800086',
            accountNumber: '88181111',
            password:      'Secure@1234'
        });
        expect([201, 409]).toContain(res.status); // 409 if run twice
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PASSWORD HASHING
// ─────────────────────────────────────────────────────────────────────────────
describe('Password Security', () => {
    test('Stored password is hashed — plain text is never stored', async () => {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: 'testuser99' });

        if (!user) return; // registration may have been skipped if 409

        expect(user.password).not.toBe('Secure@1234');
        expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    test('bcrypt compare correctly validates password', async () => {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: 'testuser99' });
        if (!user) return;

        const isMatch = await bcrypt.compare('Secure@1234', user.password);
        expect(isMatch).toBe(true);

        const isWrong = await bcrypt.compare('WrongPassword', user.password);
        expect(isWrong).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. JWT AUTHENTICATION GUARD
// ─────────────────────────────────────────────────────────────────────────────
describe('JWT Authentication', () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    test('Rejects /api/pay with no token (401)', async () => {
        const res = await request(app).post('/api/pay').send({
            userId: fakeId, amount: 100, payeeName: 'Jane Doe',
            payeeAccount: '88182222', swiftCode: 'DEUTDEDB', currency: 'ZAR'
        });
        expect(res.status).toBe(401);
    });

    test('Rejects /api/pay with an invalid token (403)', async () => {
        const res = await request(app)
            .post('/api/pay')
            .set('Authorization', 'Bearer this.is.not.a.real.token')
            .send({ userId: fakeId, amount: 100 });
        expect(res.status).toBe(403);
    });

    test('Rejects /api/transactions/:id with no token (401)', async () => {
        const res = await request(app).get(`/api/transactions/${fakeId}`);
        expect(res.status).toBe(401);
    });

    test('Rejects IDOR — token user cannot access another user\'s transactions (403)', async () => {
        const differentId = new mongoose.Types.ObjectId().toString();
        const token = jwt.sign({ id: fakeId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get(`/api/transactions/${differentId}`)   // different user's ID
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────
describe('Rate Limiting', () => {
    test('Login endpoint blocks after 5 failed attempts', async () => {
        const attempts = [];
        for (let i = 0; i < 6; i++) {
            attempts.push(
                request(app).post('/api/login').send({
                    username: 'nobody', accountNumber: '88180000', password: 'Wrong@1234'
                })
            );
        }
        const results = await Promise.all(attempts);
        const statuses = results.map((r) => r.status);
        // At least one request should be rate-limited (429)
        expect(statuses).toContain(429);
    }, 20000);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. EMPLOYEE PORTAL ISOLATION
// ─────────────────────────────────────────────────────────────────────────────
describe('Role-based Access Control', () => {
    test('Customer token cannot access /api/all-payments (403)', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const customerToken = jwt.sign({ id: fakeId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get('/api/all-payments')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(403);
    });
});