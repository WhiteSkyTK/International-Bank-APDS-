# 🌐 GlobalPay — International Payments Portal

> **APDS7311 — Customer & Employee Portal**  
> A secure international banking payments system built with React + Vite (frontend) and Node.js + Express (backend), connected to MongoDB Atlas.

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
- [Employee Accounts Setup](#employee-accounts-setup)
- [Running Tests](#running-tests)
- [DevSecOps Pipeline](#devsecops-pipeline)
- [API Endpoints](#api-endpoints)
- [Demo Videos](#demo-videos)

---

## Overview

GlobalPay is a secure international payments portal with two separate portals:

**Customer Portal** (`/login`) — Blue theme
- Register and log in securely with hashed credentials
- View account balance and transaction history
- Submit international SWIFT payments to payees worldwide
- Real-time notifications for account activity
- Balance conversion into foreign currencies
- Automatic session timeout after 90 seconds of inactivity

**Employee Portal** (`/employee/login`) — Red theme
- Pre-configured staff accounts only — no self-registration possible
- View all customer payments pending verification
- Verify SWIFT codes and approve or reject transactions
- Batch submit verified payments to the SWIFT network
- Full security audit log of all system events
- IT support page for staff

All traffic is served over SSL. All inputs are validated with strict RegEx whitelisting on frontend and backend. Protected against Session Hijacking, Clickjacking, SQL Injection, XSS, Man-in-the-Middle, and DDoS attacks.

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt · salt rounds: 12 |
| Input whitelisting | Strict RegEx on every field · frontend + backend |
| Data in transit | Self-signed SSL · HTTPS on all routes · TLS 1.3 |
| Authentication | JWT tokens · 2h customer / 8h employee |
| Session timeout | Auto-logout after 90s inactivity (customer) |
| Clickjacking | `X-Frame-Options: DENY` via Helmet |
| XSS protection | `X-Content-Type-Options: nosniff` · CSP headers |
| Rate limiting | Max 5 login attempts per 15 min (express-rate-limit) |
| IDOR protection | JWT user ID matched against every requested resource |
| Role separation | Customer and employee roles enforced server-side |
| DDoS mitigation | Rate limiting + 10kb payload size cap |
| Audit logging | All login, payment, and admin actions stored in DB |
| No employee registration | Accounts seeded by admin only |

---

## Tech Stack

**Frontend:** React 18 + Vite · React Router DOM · Tailwind CSS · Lucide React · prop-types

**Backend:** Node.js + Express · MongoDB Atlas + Mongoose · bcrypt · jsonwebtoken · Helmet · express-rate-limit · node:https

**DevSecOps:** GitHub Actions · CircleCI + SonarQube · CodeQL · npm audit · ESLint · Jest + Supertest · Dependabot

---

## Project Structure

```
APDS/
├── .circleci/
│   └── config.yml               # CircleCI + SonarQube pipeline
├── .github/
│   ├── workflows/devsecops.yml  # GitHub Actions pipeline
│   └── dependabot.yml
├── backend/
│   ├── certs/                   # SSL key + cert
│   ├── tests/security.test.js   # Jest API security tests
│   ├── server.js
│   ├── seed.js                  # Creates employee accounts
│   └── package.json
├── src/
│   ├── components/layout/
│   │   ├── AuthLayout.jsx           # Customer (blue)
│   │   ├── DashboardLayout.jsx
│   │   ├── EmployeeAuthLayout.jsx   # Employee (red)
│   │   └── EmployeeLayout.jsx
│   ├── hooks/useInactivityLogout.js
│   ├── pages/
│   │   ├── auth/                # Login, Register, Forgot*
│   │   ├── dashboard/           # Overview, MakePayment, Transactions, Profile, Security, Support
│   │   └── employee/            # EmployeeLogin, Dashboard, Payments, SecurityLog, Support
│   └── utils/
│       ├── security.js          # RegEx whitelist patterns
│       ├── secureFetch.js       # JWT-aware fetch wrapper
│       └── swiftCodes.js        # SWIFT bank reference data
├── public/
│   ├── wallet-bg.png            # Customer background
│   └── New.jpg                  # Employee background
└── sonar-project.properties
```

---

## Getting Started

### Prerequisites

- Node.js v18+ · npm v9+ · MongoDB Atlas account · OpenSSL

### Setup

```bash
# Clone
git clone https://github.com/WhiteSkyTK/International-Bank-APDS-.git
cd International-Bank-APDS-

# Frontend dependencies
npm install --legacy-peer-deps

# Backend dependencies
cd backend && npm install
```

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/globalpay
JWT_SECRET=your-strong-random-secret-here
```

---

## SSL Certificate Setup

```bash
cd backend && mkdir certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/CN=localhost"
```

---

## Running the Application

**Terminal 1 — Backend**
```bash
cd backend && node server.js
```

**Terminal 2 — Frontend**
```bash
npm run dev
```

| Portal | URL |
|---|---|
| Customer login | `https://localhost:5173/login` |
| Customer register | `https://localhost:5173/register` |
| Employee login | `https://localhost:5173/employee/login` |

> Click **Advanced → Proceed to localhost** to accept the self-signed certificate.

---

## Employee Accounts Setup

Run once after backend starts:

```bash
cd backend && node seed.js
```

| Username | Employee ID | Password |
|---|---|---|
| `emp.james` | `EMP001` | `Employee@1234` |
| `emp.sarah` | `EMP002` | `Employee@5678` |
| `emp.david` | `EMP003` | `Employee@9012` |

No registration endpoint exists — accounts can only be created via `seed.js`.

---

## Running Tests

```bash
cd backend && npm test
```

Covers: security headers · input whitelisting (SQLi/XSS rejection) · bcrypt hashing · JWT auth · IDOR protection · role-based access control.

---

## DevSecOps Pipeline

**GitHub Actions** (triggers on every push to `main`):

| Job | Tool | Purpose |
|---|---|---|
| SAST | CodeQL | Source vulnerability scanning |
| SCA | npm audit | Dependency CVE checking |
| Lint | ESLint | Code quality enforcement |
| API tests | Jest + Supertest | Security endpoint testing |
| Build | Vite | Compile verification |

**CircleCI** (triggers on every push):

| Job | Tool | Purpose |
|---|---|---|
| SAST | SonarQube | Hotspot and code smell detection |
| SCA | npm audit | Dependency vulnerability scan |
| API tests | Jest | Security test suite |
| Build | Vite | Build verification |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| POST | `/api/register` | None | Register customer |
| POST | `/api/login` | None | Customer login → JWT |
| POST | `/api/employee/login` | None | Employee login → JWT |
| POST | `/api/pay` | JWT (customer) | Submit SWIFT payment |
| GET | `/api/transactions/:userId` | JWT (customer) | Transaction history |
| GET | `/api/notifications/:userId` | JWT | Notifications |
| PATCH | `/api/notifications/:userId/read-all` | JWT | Mark all read |
| DELETE | `/api/notifications/:id` | JWT | Dismiss notification |
| GET | `/api/employee/payments` | JWT (employee) | All customer payments |
| PATCH | `/api/employee/payments/:id/verify` | JWT (employee) | Verify payment |
| PATCH | `/api/employee/payments/:id/reject` | JWT (employee) | Reject + refund |
| POST | `/api/employee/submit-swift` | JWT (employee) | Submit to SWIFT |
| GET | `/api/employee/audit-log` | JWT (employee) | Security audit log |

---

## Demo Videos

| Task | Video |
|---|---|
| Task 2 — Customer Portal | [▶ Watch on YouTube](https://youtu.be/-smfDPmT8pk) |
| Task 3 — Employee Portal | [▶ Watch on YouTube](https://youtu.be/7_6B40F__m0) |

---

## Student Information

| Student Number | Name |
|---|---|
| ST10296818 | Tokollo Will Nonyane |
| ST1039372  | Ramakuela Phathutshedzo |
| ST10367584 | Gundo Mathantshani |
| ST10538419 | Christian Bulabula |
| ST10387834 | Neo Mthokozisi Yende |

**Module:** APDS7311 &nbsp;|&nbsp; **Tasks:** 2 & 3 &nbsp;|&nbsp; **Institution:** The IIE Rosebank Collage

---

> *All security implementations are for educational purposes as part of the APDS7311 module.*
