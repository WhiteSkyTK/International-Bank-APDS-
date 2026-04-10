import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';

export const Register = () => {
    const navigate = useNavigate();
    const handleReg = (e) => { e.preventDefault(); alert("Securely Registered!"); navigate('/login'); };
    
    return (
        <AuthLayout type="register">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Welcome 👋</h2>
            <p className="text-gray-500 mb-10 text-sm font-medium">Please register to create your account</p>
            
            <form onSubmit={handleReg} className="space-y-6">
                <InputField label="Full Name" defaultValue="John Smith" />
                <InputField label="ID Number" defaultValue="0012176101083" />
                <InputField label="Account Number" defaultValue="10296818" />
                <InputField label="Password" type="password" defaultValue="********" />
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-4 rounded-full shadow-lg mt-6 transition transform hover:scale-[1.02]">
                    Register
                </button>
            </form>
        </AuthLayout>
    );
};