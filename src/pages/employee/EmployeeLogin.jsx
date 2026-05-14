// src/pages/employee/EmployeeLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeAuthLayout } from '../../components/layout/EmployeeAuthLayout';
import { InputField } from '../../components/common/InputField';

// Whitelist patterns (mirrors backend)
const patterns = {
    username:   /^[a-zA-Z0-9_.]{4,20}$/,
    employeeId: /^EMP\d{3,6}$/,
    password:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

export const EmployeeLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', employeeId: '', password: '' });
    const [error,   setError]    = useState('');
    const [loading, setLoading]  = useState(false);

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!patterns.username.test(formData.username))
            return setError('Invalid username format.');
        if (!patterns.employeeId.test(formData.employeeId))
            return setError('Employee ID must be in format EMP001.');
        if (!patterns.password.test(formData.password))
            return setError('Password does not meet security requirements.');

        setLoading(true);
        try {
            const res = await fetch('https://localhost:5000/api/employee/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('empToken',    data.token);
                localStorage.setItem('employee',    JSON.stringify(data.employee));
                navigate('/employee/dashboard');
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch {
            setError('Cannot connect to secure server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <EmployeeAuthLayout>
            <h2 className="text-4xl font-bold text-red-600 mb-1 tracking-tight">
                Let's Get Back To Work 💼
            </h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">
                Staff credentials required — no public registration available.
            </p>

            {error && (
                <p className="text-red-600 text-xs font-bold mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                    {error}
                </p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. emp.james"
                />
                <InputField
                    label="Employee ID"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. EMP001"
                />
                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                />

                <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">🔐</span>
                    <p className="text-[11px] text-red-600 font-medium leading-tight">
                        Min 8 chars · Must include uppercase, number &amp; special character
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02] mt-2"
                >
                    {loading ? 'Authenticating…' : 'Staff Login'}
                </button>
            </form>
        </EmployeeAuthLayout>
    );
};