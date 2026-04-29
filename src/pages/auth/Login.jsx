import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';
import { SecurityPatterns } from '../../utils/security';

export const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        accountNumber: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Frontend whitelisting before hitting the server
        if (!SecurityPatterns.username.test(formData.username)) {
            return setError('Invalid username format.');
        }
        if (!SecurityPatterns.accountNumber.test(formData.accountNumber)) {
            return setError('Account number must be 8–12 digits.');
        }
        if (!SecurityPatterns.password.test(formData.password)) {
            return setError('Password does not meet security requirements.');
        }

        setLoading(true);
        try {
            const response = await fetch('https://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    accountNumber: formData.accountNumber,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token + user object
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('Cannot connect to secure server. Ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout type="login">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">
                Welcome Back 👋
            </h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">
                Please login to your account
            </p>

            {error && (
                <p className="text-red-500 text-xs font-bold mb-4 p-2 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </p>
            )}

            <form onSubmit={handleLogin} className="flex flex-col">
                <div className="space-y-4 mb-4">
                    <InputField
                        label="User Name"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="e.g. jsmith"
                    />
                    <InputField
                        label="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="8–12 digits"
                    />
                    <InputField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />
                </div>

                {/* Password hint */}
                <div className="bg-[#EAF2ED] rounded-xl p-3 flex items-center gap-3 mb-4">
                    <span className="text-xl">🔐</span>
                    <p className="text-[11px] text-[#607D75] font-medium leading-tight">
                        Min 8 chars · Must include uppercase,<br />
                        number &amp; special character
                    </p>
                </div>

                {/* Forgot links — matching the screenshot */}
                <div className="flex flex-col items-end gap-1 text-[13px] text-[#4A80D4] font-medium mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-username')}
                        className="hover:text-[#3A68B0] transition opacity-80"
                    >
                        Forgot User Name?
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="hover:text-[#3A68B0] transition opacity-80"
                    >
                        Forgot Password?
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-account')}
                        className="hover:text-[#3A68B0] transition opacity-80"
                    >
                        Forgot Account Number?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </AuthLayout>
    );
};