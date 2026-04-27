import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';
import { SecurityPatterns } from '../../utils/security';

export const ForgotUsername = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ idNumber: '', accountNumber: '' });
    const [msg, setMsg] = useState({ text: '', isError: false });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRecovery = (e) => { 
        e.preventDefault(); 
        
        // Validate inputs against Whitelist
        if (!SecurityPatterns.idNumber.test(formData.idNumber)) {
            return setMsg({ text: "Invalid ID Number format.", isError: true });
        }
        if (!SecurityPatterns.accountNumber.test(formData.accountNumber)) {
            return setMsg({ text: "Invalid Account Number format.", isError: true });
        }
        
        setMsg({ text: "If details match, your username has been sent to your email.", isError: false });
        setTimeout(() => navigate('/login'), 4000);
    };
    
    return (
        <AuthLayout type="login">
            <h2 className="text-3xl font-bold text-[#4A80D4] mb-1">Forgot Username?</h2>
            <p className="text-gray-500 mb-8 text-sm">Enter your registered details to recover your ID</p>
            
            {msg.text && (
                <p className={`text-xs font-bold mb-4 p-2 rounded border ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {msg.text}
                </p>
            )}

            <form onSubmit={handleRecovery} className="space-y-4">
                <InputField 
                    label="ID Number" name="idNumber" 
                    value={formData.idNumber} onChange={handleChange} 
                    placeholder="13 Digits"
                />
                <InputField 
                    label="Account Number" name="accountNumber" 
                    value={formData.accountNumber} onChange={handleChange} 
                    placeholder="8-12 Digits"
                />
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-3.5 rounded-xl mt-4 transition">
                    Recover Username
                </button>
            </form>
        </AuthLayout>
    );
};