# 🌐 GlobalPay — International Payments Portal

> **APDS7311 Part 2 — Customer Portal**  
> A secure international banking payments portal built with React + Vite (frontend) and Node.js + Express (backend), connected to MongoDB Atlas.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Security Features](#security-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [DevSecOps Pipeline](#devsecops-pipeline)
- [API Endpoints](#api-endpoints)
- [Demo Video](#demo-video)

---

## Overview

GlobalPay is a secure customer-facing international payments portal that allows registered customers to:

- Register and log in securely using hashed credentials
- View their account balance and transaction history
- Submit international SWIFT payments to payees worldwide
- Receive real-time notifications for account activity
- View their balance converted into foreign currencies

All traffic is served over SSL. All inputs are validated using strict RegEx whitelisting on both the frontend and backend. The application is protected against Session Hijacking, Clickjacking, SQL Injection, XSS, Man-in-the-Middle, and DDoS attacks.

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with salt rounds: 12 |
| Input whitelisting | Strict RegEx on all fields, frontend + backend |
| Data in transit | Self-signed SSL certificate, HTTPS on all routes |
| Authentication | JWT tokens, 2-hour expiry |
| Session timeout | Auto-logout after 90 seconds of inactivity |
| Clickjacking | `X-Frame-Options: DENY` via Helmet |
| XSS protection | `X-Content-Type-Options: nosniff` via Helmet |
| MIME sniffing | Helmet middleware |
| Rate limiting | Max 5 login attempts per 15 minutes (express-rate-limit) |
| IDOR protection | JWT user ID matched against requested resource ID |
| Role separation | Customer and employee roles enforced server-side |
| DDoS mitigation | Rate limiting + payload size limit (10kb) |

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router DOM
- Tailwind CSS
- Lucide React (icons)

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- Helmet (security headers)
- express-rate-limit (brute force protection)
- HTTPS (SSL/TLS)

**DevSecOps**
- GitHub Actions (CI/CD pipeline)
- CodeQL (Static Application Security Testing)
- npm audit (Software Composition Analysis)
- ESLint (code quality)
- Jest + Supertest (API security tests)
- Dependabot (automated dependency updates)

---

## Project Structure

```
APDS/
├── .github/
│   ├── workflows/
│   │   └── devsecops.yml        # CI/CD pipeline
│   └── dependabot.yml           # Automated dependency scanning
│
├── backend/
│   ├── certs/
│   │   ├── server.key           # SSL private key
│   │   └── server.cert          # SSL certificate
│   ├── tests/
│   │   └── security.test.js     # Jest API security tests
│   ├── server.js                # Express API server
│   ├── .env                     # Environment variables (not committed)
│   └── package.json
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── InputField.jsx
│   │   │   └── SecurityBadge.jsx
│   │   ├── graphics/
│   │   │   └── WaveBackground.jsx
│   │   └── layout/
│   │       ├── AuthLayout.jsx
│   │       └── DashboardLayout.jsx
│   ├── hooks/
│   │   └── useInactivityLogout.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ForgotUsername.jsx
│   │   │   └── ForgotAccount.jsx
│   │   └── dashboard/
│   │       ├── Overview.jsx
│   │       ├── MakePayment.jsx
│   │       ├── Transactions.jsx
│   │       ├── Profile.jsx
│   │       ├── Security.jsx
│   │       └── Support.jsx
│   ├── utils/
│   │   ├── security.js          # RegEx whitelist patterns
│   │   ├── secureFetch.js       # JWT-aware fetch wrapper
│   │   └── swiftCodes.js        # SWIFT code reference data
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│   └── wallet-bg.png
├── sonar-project.properties     # SonarQube config (optional)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier is sufficient)
- OpenSSL (for generating SSL certificates)

### 1. Clone the repository

```bash
git clone https://github.com/WhiteSkyTK/International-Bank-APDS-.git
cd International-Bank-APDS-
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/globalpay?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-here
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## SSL Certificate Setup

The backend runs over HTTPS. Generate a self-signed certificate for local development:

```bash
cd backend
mkdir certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/CN=localhost"
```

---

## Running the Application

Open **two terminals** simultaneously:

**Terminal 1 — Backend API**
```bash
cd backend
node server.js
```
The API will be available at `https://localhost:5000`

**Terminal 2 — Frontend**
```bash
npm run dev
```
The app will be available at `https://localhost:5173`

> ℹ️ Your browser will show a security warning for the self-signed certificate. Click **Advanced → Proceed to localhost** to continue.

---

## Running Tests

```bash
cd backend
npm test
```

The test suite covers:

- Security headers (Helmet — X-Frame-Options, X-Content-Type-Options, HSTS)
- Input whitelisting (SQL injection, XSS, weak passwords rejected)
- Password hashing (bcrypt format verified, plain text never stored)
- JWT authentication (missing token → 401, invalid token → 403)
- IDOR protection (user cannot access another user's data)
- Role-based access control (customer token blocked from employee endpoints)

---

## DevSecOps Pipeline

The GitHub Actions pipeline runs automatically on every push to `main` or `master`.

**Pipeline jobs:**

| Job | Tool | Purpose |
|---|---|---|
| SAST | CodeQL | Scans source code for security vulnerabilities and code smells |
| SCA | npm audit | Checks all npm packages against the CVE database |
| Code quality | ESLint | Enforces code style and catches common errors |
| API tests | Jest + Supertest | Runs the security test suite against a live MongoDB container |
| Build check | Vite | Confirms the React app compiles successfully |

View pipeline results under the **Actions** tab on GitHub.  
View CodeQL findings under **Security → Code scanning** on GitHub.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| POST | `/api/register` | None | Register a new customer |
| POST | `/api/login` | None | Login and receive JWT |
| POST | `/api/pay` | JWT | Submit a SWIFT payment |
| GET | `/api/transactions/:userId` | JWT | Get transaction history |
| GET | `/api/notifications/:userId` | JWT | Get notifications |
| PATCH | `/api/notifications/:userId/read-all` | JWT | Mark all notifications read |
| DELETE | `/api/notifications/:id` | JWT | Dismiss a notification |
| GET | `/api/all-payments` | JWT (employee) | View all payments (employee only) |
| PATCH | `/api/payments/:id/verify` | JWT (employee) | Verify a payment (employee only) |

---

## Demo Video

A full walkthrough video demonstrating all features is available here:

**[▶ Watch Demo on YouTube]([https://youtube.com/your-unlisted-link-here](https://youtu.be/-smfDPmT8pk))**

The video covers:
1. Starting the backend and frontend servers
2. Registering a new account (with invalid input rejection shown)
3. Logging in with valid credentials
4. Dashboard — balance card, currency converter, recent transactions
5. Making an international SWIFT payment using the bank picker
6. Viewing transaction history
7. Notification panel (live from database)
8. Profile page — eye icon reveal/hide for sensitive fields
9. SSL padlock and certificate details in browser
10. Inactivity timeout warning modal and auto-logout
11. Security settings page
12. GitHub Actions pipeline running with green checks

---

## Student Information

| | |
|---|---|
| **Student Number** | ST10296818 |
| **Student Name** | Tokollo Will Nonyane |
| **Module** | APDS7311 |
| **Task** | Part 2 — Customer Portal |
| **Institution** | The IIE |

---

> *This project was developed as part of the APDS7311 module. All security implementations are for educational purposes.*
