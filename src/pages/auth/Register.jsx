import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';
import { SecurityPatterns } from '../../utils/security';

export const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        idNumber: '',
        accountNumber: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleReg = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // Frontend whitelisting (mirrors backend patterns)
        if (!SecurityPatterns.name.test(formData.fullName))
            return setErrorMsg('Full name: letters only, 2–50 characters.');
        if (!SecurityPatterns.username.test(formData.username))
            return setErrorMsg('Username: 4–20 alphanumeric characters or underscores.');
        if (!SecurityPatterns.idNumber.test(formData.idNumber))
            return setErrorMsg('ID number must be exactly 13 digits.');
        if (formData.accountNumber && !SecurityPatterns.accountNumber.test(formData.accountNumber))
            return setErrorMsg('Account number must be 8–12 digits (or leave blank to auto-generate).');
        if (!SecurityPatterns.password.test(formData.password))
            return setErrorMsg('Password must be 8+ chars with uppercase, number, and special character.');

        setLoading(true);
        try {
            const response = await fetch('https://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(
                    `Account created! Your account number is: ${data.accountNumber}. Please note it down before logging in.`
                );
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setErrorMsg(data.error || 'Registration failed.');
            }
        } catch (err) {
            setErrorMsg('Cannot connect to server. Ensure the backend is running over HTTPS.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout type="register">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Welcome 👋</h2>
            <p className="text-gray-500 mb-6 text-sm font-medium">
                Please register to create your account
            </p>

            {errorMsg && (
                <p className="text-red-500 text-xs font-bold mb-4 p-2 bg-red-50 rounded-lg border border-red-200">
                    {errorMsg}
                </p>
            )}
            {successMsg && (
                <p className="text-green-600 text-xs font-bold mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
                    {successMsg}
                </p>
            )}

            <form onSubmit={handleReg} className="space-y-4">
                <InputField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Smith"
                />
                <InputField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. jsmith (used to log in)"
                />
                <InputField
                    label="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="13-digit South African ID"
                />
                <InputField
                    label="Account Number (optional — leave blank to auto-generate)"
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
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] disabled:opacity-60 text-white font-bold py-4 rounded-full shadow-lg mt-6 transition transform hover:scale-[1.02]"
                >
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
        </AuthLayout>
    );
};