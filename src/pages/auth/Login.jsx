import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';

export const Login = () => {
    const navigate = useNavigate();
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('https://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountNumber, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Securely store the handshake data
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.fullName);
                localStorage.setItem('userBalance', data.user.balance);
                navigate('/dashboard');
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Cannot connect to secure server. Ensure backend is running.");
        }
    };

    return (
        <AuthLayout type="login">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Welcome Back 👋</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Please login to your account</p>
            
            {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

            <form onSubmit={handleLogin} className="flex flex-col">
                <div className="space-y-4 mb-6">
                    <InputField 
                        label="Account Number" 
                        value={accountNumber} 
                        onChange={(e) => setAccountNumber(e.target.value)} 
                    />
                    <InputField 
                        label="Password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                
                <div className="bg-[#EAF2ED] rounded-xl p-3 flex items-center gap-3 mb-4">
                    <span className="text-xl">🔐</span>
                    <p className="text-[11px] text-[#607D75] font-medium leading-tight">
                        Min 8 chars · Must include uppercase,<br/>number & special character
                    </p>
                </div>

                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]">
                    Login
                </button>
            </form>
        </AuthLayout>
    );
};