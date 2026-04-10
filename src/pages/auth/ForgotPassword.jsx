import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const handleReset = (e) => { e.preventDefault(); alert("Password reset link sent!"); navigate('/login'); };
    
    return (
        <AuthLayout type="login">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#D66868] mb-1 tracking-tight">Forgot Your Password 😭</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Please enter your details</p>
            
            <form onSubmit={handleReset} className="flex flex-col">
                <InputField label="User Name" defaultValue="Jsmith" />
                <InputField label="Account Number" defaultValue="10296818" />
                
                <div className="flex flex-col items-end gap-1 text-[13px] text-[#D66868] font-medium mb-6 mt-2">
                    <button type="button" onClick={() => navigate('/login')} className="hover:text-[#b85454] transition opacity-70">
                        Remember Password?
                    </button>
                </div>
                
                <button type="submit" className="w-full bg-[#D66868] hover:bg-[#b85454] text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]">
                    Reset Password
                </button>
            </form>
        </AuthLayout>
    );
};