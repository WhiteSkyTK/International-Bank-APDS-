import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';
import { SecurityPatterns } from '../../utils/security';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ accountNumber: '', username: '' });
    const [msg, setMsg] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleReset = (e) => { 
        e.preventDefault(); 
        
        // Basic validation
        if (!SecurityPatterns.accountNumber.test(formData.accountNumber)) {
            return setMsg("Invalid account format.");
        }
        
        setMsg("If an account matches these details, a secure reset link has been sent.");
        setTimeout(() => navigate('/login'), 3000); // Auto-redirect after 3 seconds
    };
    
    return (
        <AuthLayout type="login">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Forgot Password? 🔐</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Enter your details to receive a reset link</p>
            
            {msg && <p className="text-green-600 text-xs font-bold mb-4 p-2 bg-green-50 rounded border border-green-200">{msg}</p>}

            <form onSubmit={handleReset} className="flex flex-col space-y-4">
                <InputField 
                    label="User Name" name="username" 
                    value={formData.username} onChange={handleChange} 
                />
                <InputField 
                    label="Account Number" name="accountNumber" 
                    value={formData.accountNumber} onChange={handleChange} 
                />
                
                <div className="flex flex-col items-end gap-1 text-[13px] text-[#4A80D4] font-medium mb-6 mt-2">
                    <button type="button" onClick={() => navigate('/login')} className="hover:text-[#3A68B0] transition opacity-70">
                        Remember Password?
                    </button>
                </div>
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]">
                    Reset Password
                </button>
            </form>
        </AuthLayout>
    );
};