// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Customer Auth
import { Login }          from './pages/auth/Login';
import { Register }       from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ForgotUsername } from './pages/auth/ForgotUsername';
import { ForgotAccount }  from './pages/auth/ForgotAccount';

// Customer Dashboard
import { Overview }     from './pages/dashboard/Overview';
import { MakePayment }  from './pages/dashboard/MakePayment';
import { Security }     from './pages/dashboard/Security';
import { Transactions } from './pages/dashboard/Transactions';
import { Profile }      from './pages/dashboard/Profile';
import { Support }      from './pages/dashboard/Support';

// Employee Portal
import { EmployeeLogin }       from './pages/employee/EmployeeLogin';
import { EmployeeDashboard }   from './pages/employee/EmployeeDashboard';
import { EmployeePayments }    from './pages/employee/EmployeePayments';
import { EmployeeSecurityLog } from './pages/employee/EmployeeSecurityLog';
import { EmployeeSupport }     from './pages/employee/EmployeeSupport';

// Route guards
const CustomerRoute = ({ children }) => {
    const ok = localStorage.getItem('user') && localStorage.getItem('token');
    return ok ? children : <Navigate to="/login" replace />;
};

const EmployeeRoute = ({ children }) => {
    const ok = localStorage.getItem('employee') && localStorage.getItem('empToken');
    return ok ? children : <Navigate to="/employee/login" replace />;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Customer auth */}
                <Route path="/"                element={<Login />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-username" element={<ForgotUsername />} />
                <Route path="/forgot-account"  element={<ForgotAccount />} />

                {/* Customer dashboard */}
                <Route path="/dashboard"    element={<CustomerRoute><Overview /></CustomerRoute>} />
                <Route path="/payment"      element={<CustomerRoute><MakePayment /></CustomerRoute>} />
                <Route path="/transactions" element={<CustomerRoute><Transactions /></CustomerRoute>} />
                <Route path="/profile"      element={<CustomerRoute><Profile /></CustomerRoute>} />
                <Route path="/security"     element={<CustomerRoute><Security /></CustomerRoute>} />
                <Route path="/support"      element={<CustomerRoute><Support /></CustomerRoute>} />

                {/* Employee portal */}
                <Route path="/employee/login"        element={<EmployeeLogin />} />
                <Route path="/employee/dashboard"    element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
                <Route path="/employee/payments"     element={<EmployeeRoute><EmployeePayments /></EmployeeRoute>} />
                <Route path="/employee/security-log" element={<EmployeeRoute><EmployeeSecurityLog /></EmployeeRoute>} />
                <Route path="/employee/support"      element={<EmployeeRoute><EmployeeSupport /></EmployeeRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}