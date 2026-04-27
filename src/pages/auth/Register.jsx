import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { InputField } from '../../components/common/InputField';
import { SecurityPatterns } from '../../utils/security';

export const Register = () => {
    const navigate = useNavigate();
    
    // State to hold the form data
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        accountNumber: '',
        password: ''
    });
    
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReg = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // 1. RUBRIC: Strict Frontend RegEx Validation (Whitelisting)
        if (!SecurityPatterns.name.test(formData.fullName)) return setErrorMsg("Invalid Name format. Letters only.");
        if (!SecurityPatterns.idNumber.test(formData.idNumber)) return setErrorMsg("ID must be exactly 13 digits.");
        if (!SecurityPatterns.accountNumber.test(formData.accountNumber)) return setErrorMsg("Account number must be 8-12 digits.");
        if (!SecurityPatterns.password.test(formData.password)) return setErrorMsg("Password does not meet strict security requirements.");

        // 2. Send to Secure Backend
        try {
            const response = await fetch('https://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account securely created! Please log in.");
                navigate('/login');
            } else {
                setErrorMsg(data.error || "Registration failed.");
            }
        } catch (err) {
            setErrorMsg("Cannot connect to server. Ensure backend is running over HTTPS.");
        }
    };
    
    return (
        <AuthLayout type="register">
            <h2 className="text-4xl font-bold text-[#4A80D4] mb-1 tracking-tight">Welcome 👋</h2>
            <p className="text-gray-500 mb-6 text-sm font-medium">Please register to create your account</p>
            
            {errorMsg && <p className="text-red-500 text-xs font-bold mb-4 p-2 bg-red-50 rounded border border-red-200">{errorMsg}</p>}
            
            <form onSubmit={handleReg} className="space-y-4">
                <InputField 
                    label="Full Name" name="fullName" 
                    value={formData.fullName} onChange={handleChange} 
                    placeholder="e.g. John Smith" 
                />
                <InputField 
                    label="ID Number" name="idNumber" 
                    value={formData.idNumber} onChange={handleChange} 
                    placeholder="13 Digit ID" 
                />
                <InputField 
                    label="Account Number" name="accountNumber" 
                    value={formData.accountNumber} onChange={handleChange} 
                    placeholder="8-12 Digits" 
                />
                <InputField 
                    label="Password" name="password" type="password" 
                    value={formData.password} onChange={handleChange} 
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol" 
                />
                
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white font-bold py-4 rounded-full shadow-lg mt-6 transition transform hover:scale-[1.02]">
                    Register
                </button>
            </form>
        </AuthLayout>
    );
};