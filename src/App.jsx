import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ForgotUsername } from './pages/auth/ForgotUsername';
import { ForgotAccount } from './pages/auth/ForgotAccount';
import { Dashboard } from './pages/dashboard/Dashboard';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Recovery Routes */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-username" element={<ForgotUsername />} />
                <Route path="/forgot-account" element={<ForgotAccount />} />
                
                {/* Main App Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}