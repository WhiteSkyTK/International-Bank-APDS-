import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ForgotUsername } from './pages/auth/ForgotUsername';
import { ForgotAccount } from './pages/auth/ForgotAccount';

// Dashboard Pages
import { Overview } from './pages/dashboard/Overview';
import { MakePayment } from './pages/dashboard/MakePayment';
import { Security } from './pages/dashboard/Security';
import { Transactions } from './pages/dashboard/Transactions';
import { Profile } from './pages/dashboard/Profile';
import { Support } from './pages/dashboard/Support';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Auth */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-username" element={<ForgotUsername />} />
                <Route path="/forgot-account" element={<ForgotAccount />} />
                
                {/* Internal App */}
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/payment" element={<MakePayment />} />
                <Route path="/security" element={<Security />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/support" element={<Support />} />
                
                {/* Note: Create /transactions, /profile, /support pages later to finish the set! */}
            </Routes>
        </Router>
    );
}