import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';

export const ForgotUsername = () => {
    const navigate = useNavigate();
    const handleRecovery = (e) => { e.preventDefault(); alert("Username recovery initiated!"); navigate('/login'); };
    
    return (
        <AuthLayout type="login">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Forgot Your User Name 😭</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Please enter your details</p>
            
            <form onSubmit={handleRecovery} className="flex flex-col">
                <InputField label="ID Number" defaultValue="0012176101083" />
                <InputField label="Account Number" defaultValue="10296818" />
                
                <div className="flex flex-col items-end gap-1 text-[13px] text-[#4A80D4] font-medium mb-6 mt-2">
                    <button type="button" onClick={() => navigate('/login')} className="hover:text-[#3A68B0] transition opacity-70">
                        Have an Account?
                    </button>
                </div>
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-3.5 rounded-xl shadow-md transition transform hover:scale-[1.02]">
                    Get User Name
                </button>
            </form>
        </AuthLayout>
    );
};