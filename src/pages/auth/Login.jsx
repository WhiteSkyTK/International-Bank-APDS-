import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';

export const Login = () => {
    const navigate = useNavigate();
    const handleLogin = (e) => { e.preventDefault(); navigate('/dashboard'); };
    
    return (
        <AuthLayout type="login">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Welcome Back 👋</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Please login to your account</p>
            
            <form onSubmit={handleLogin} className="flex flex-col">
                <InputField label="User Name" defaultValue="Jsmith" />
                <InputField label="Account Number" defaultValue="10296818" />
                <InputField label="Password" type="password" defaultValue="********" />
                
                {/* Password Hint Box (Matches Figma) */}
                <div className="bg-[#EAF2ED] rounded-xl p-3 flex items-center gap-3 mb-4">
                    <span className="text-xl">🔐</span>
                    <p className="text-[11px] text-[#607D75] font-medium leading-tight">
                        Min 8 chars · Must include uppercase,<br/>number & special character
                    </p>
                </div>

                {/* Forgot Links */}
                <div className="flex flex-col items-end gap-1 text-[13px] text-[#7B96B5] font-medium mb-6">
                    <button type="button" onClick={() => navigate('/forgot-username')} className="hover:text-[#4A80D4] transition">Forgot User Name?</button>
                    <button type="button" onClick={() => navigate('/forgot-password')} className="hover:text-[#4A80D4] transition">Forgot Password?</button>
                    <button type="button" onClick={() => navigate('/forgot-account')} className="hover:text-[#4A80D4] transition">Forgot Account Number?</button>
                </div>
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]">
                    Login
                </button>
            </form>
        </AuthLayout>
    );
};