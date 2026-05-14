// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Customer Auth Pages ───────────────────────────────────────────────────────
import { Login }          from './pages/auth/Login';
import { Register }       from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ForgotUsername } from './pages/auth/ForgotUsername';
import { ForgotAccount }  from './pages/auth/ForgotAccount';

// ── Customer Dashboard Pages ──────────────────────────────────────────────────
import { Overview }      from './pages/dashboard/Overview';
import { MakePayment }   from './pages/dashboard/MakePayment';
import { Security }      from './pages/dashboard/Security';
import { Transactions }  from './pages/dashboard/Transactions';
import { Profile }       from './pages/dashboard/Profile';
import { Support }       from './pages/dashboard/Support';

// ── Employee Portal Pages ─────────────────────────────────────────────────────
import { EmployeeLogin }     from './pages/employee/EmployeeLogin';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeePayments }  from './pages/employee/EmployeePayments';

// ── Route Guards ──────────────────────────────────────────────────────────────
const CustomerRoute = ({ children }) => {
    const user  = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return user && token ? children : <Navigate to="/login" replace />;
};

const EmployeeRoute = ({ children }) => {
    const emp   = localStorage.getItem('employee');
    const token = localStorage.getItem('empToken');
    return emp && token ? children : <Navigate to="/employee/login" replace />;
};

export default function App() {
    return (
        <Router>
            <Routes>

                {/* ── Customer Auth ── */}
                <Route path="/"                element={<Login />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-username" element={<ForgotUsername />} />
                <Route path="/forgot-account"  element={<ForgotAccount />} />

                {/* ── Customer Dashboard (protected) ── */}
                <Route path="/dashboard"    element={<CustomerRoute><Overview /></CustomerRoute>} />
                <Route path="/payment"      element={<CustomerRoute><MakePayment /></CustomerRoute>} />
                <Route path="/transactions" element={<CustomerRoute><Transactions /></CustomerRoute>} />
                <Route path="/profile"      element={<CustomerRoute><Profile /></CustomerRoute>} />
                <Route path="/security"     element={<CustomerRoute><Security /></CustomerRoute>} />
                <Route path="/support"      element={<CustomerRoute><Support /></CustomerRoute>} />

                {/* ── Employee Portal ── */}
                <Route path="/employee/login"     element={<EmployeeLogin />} />
                <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
                <Route path="/employee/payments"  element={<EmployeeRoute><EmployeePayments /></EmployeeRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}