import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export const MakePayment = () => {
    const navigate = useNavigate();
    
    // Form State
    const [amount, setAmount] = useState('');
    const [payeeName, setPayeeName] = useState('');
    const [payeeAccount, setPayeeAccount] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const handlePayment = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // RegEx Validation
        const swiftRegex = /^[A-Z0-9]{8,11}$/;
        if (!swiftRegex.test(swiftCode)) {
            return setErrorMsg("Invalid SWIFT Code format.");
        }

        try {
            const response = await fetch('https://localhost:5000/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId'), // Handshake ID
                    amount: parseFloat(amount),
                    payeeName,
                    payeeAccount,
                    swiftCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update balance in storage so Dashboard is correct
                localStorage.setItem('userBalance', data.newBalance);
                setShowModal(true);
            } else {
                setErrorMsg(data.error);
            }
        } catch (err) {
            setErrorMsg("Payment failed. Server unreachable.");
        }
    };

    return (
        <DashboardLayout title="Make International Payment">
            <form onSubmit={handlePayment} className="space-y-6 max-w-4xl">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">💳 Payment Amount</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Amount (ZAR)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-bold" 
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">🏦 Payee Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="Payee Full Name" 
                            className="bg-[#EAF2ED]/50 p-3 rounded-xl"
                            onChange={(e) => setPayeeName(e.target.value)} 
                            required 
                        />
                        <input 
                            placeholder="Account Number" 
                            className="bg-[#EAF2ED]/50 p-3 rounded-xl"
                            onChange={(e) => setPayeeAccount(e.target.value)} 
                            required 
                        />
                        <input 
                            placeholder="SWIFT Code" 
                            className={`bg-[#EAF2ED]/50 p-3 rounded-xl ${errorMsg ? 'border-red-500 border' : ''}`}
                            value={swiftCode}
                            onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} 
                            required 
                        />
                    </div>
                    {errorMsg && <p className="text-red-500 text-xs font-bold mt-2">{errorMsg}</p>}
                </div>

                <div className="flex justify-end gap-4">
                    <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-[#4A80D4] shadow-lg">
                        Pay Now
                    </button>
                </div>
            </form>

            {/* Success Modal remains largely the same, navigates to Dashboard on close */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center">
                        <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Payment Submitted!</h2>
                        <button onClick={() => navigate('/dashboard')} className="w-full bg-[#4A80D4] text-white py-3 rounded-xl font-bold">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};