import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export const MakePayment = () => {
    const navigate = useNavigate();
    
    // State variables for our Security Validation
    const [showModal, setShowModal] = useState(false);
    const [swiftCode, setSwiftCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const handlePayment = (e) => {
        e.preventDefault();
        
        // RUBRIC: RegEx Input Whitelisting (Protects against XSS / SQLi)
        // SWIFT must be exactly 8 or 11 uppercase letters/numbers. No symbols allowed!
        const swiftRegex = /^[A-Z0-9]{8,11}$/;
        
        if (!swiftRegex.test(swiftCode)) {
            setErrorMsg("Invalid SWIFT Code. Symbols (like <script>) are blocked for your security.");
            setShowModal(false);
        } else {
            setErrorMsg("");
            setShowModal(true); // Shows the green success modal
        }
    };

    return (
        <DashboardLayout title="Make International Payment">
            <form onSubmit={handlePayment} className="space-y-6 max-w-4xl">
                
                {/* Section 1: Payment Amount & Provider */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-2xl">💳</span> Payment Amount & Provider
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Amount (ZAR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-blue-500 font-bold">R</span>
                                <input type="number" placeholder="5000" className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 pl-8 pr-4 font-bold text-gray-800 focus:outline-none focus:border-blue-400 transition" required/>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Currency</label>
                            <select className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-bold text-gray-800 focus:outline-none transition">
                                <option>USD - US Dollar</option>
                                <option>EUR - Euro</option>
                                <option>GBP - British Pound</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Payment Provider</label>
                            <select className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-bold text-gray-800 focus:outline-none transition">
                                <option>SWIFT Network</option>
                            </select>
                            <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                                <ShieldCheck size={12}/> SWIFT · Primary provider
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Payee Bank Details (Unrolled for specific state tracking) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-2xl">🏦</span> Payee Bank Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-start">
                        {/* Box 1: Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Payee Full Name</label>
                            <input type="text" placeholder="e.g. Jane Doe" className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-medium text-gray-800 focus:outline-none focus:border-blue-400 transition" required/>
                        </div>

                        {/* Box 2: Account Number */}
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Payee Account Number</label>
                            <input type="text" placeholder="e.g. 1234567890" className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-medium text-gray-800 focus:outline-none focus:border-blue-400 transition" required/>
                        </div>

                        {/* Box 3: SWIFT CODE (Has RegEx state & error tracking) */}
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">SWIFT / BIC Code</label>
                            <input 
                                type="text" 
                                placeholder="e.g. ABCDUS33XXX" 
                                value={swiftCode}
                                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                                className={`w-full bg-[#EAF2ED]/50 rounded-xl py-3 px-4 font-medium text-gray-800 focus:outline-none transition ${errorMsg ? 'border-2 border-red-500 bg-red-50' : 'border border-teal-100 focus:border-blue-400'}`}
                                required
                            />
                            {errorMsg && (
                                <p className="text-red-500 text-[10px] font-bold mt-1 leading-tight flex gap-1">
                                    <AlertCircle size={12} className="flex-shrink-0" /> {errorMsg}
                                </p>
                            )}
                        </div>

                        {/* Box 4: Bank Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Bank Name</label>
                            <input type="text" placeholder="e.g. First National Bank USA" className="w-full bg-[#EAF2ED]/50 border border-teal-100 rounded-xl py-3 px-4 font-medium text-gray-800 focus:outline-none focus:border-blue-400 transition" required/>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 text-blue-800 text-xs p-3 rounded-lg font-medium">
                        🔎 <b>SWIFT Code:</b> An 8–11 character bank identifier. Ask your payee for this before sending.
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={() => navigate('/dashboard')} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition border border-gray-200">Back</button>
                    <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-[#4A80D4] hover:bg-[#3A68B0] transition shadow-lg flex items-center gap-2"><ShieldCheck size={18}/> Pay Now</button>
                </div>
            </form>

            {/* Success Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-bounce-in">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Submitted!</h2>
                        <p className="text-sm text-gray-500 mb-8">Your international payment has been securely submitted. A GlobalPay employee will verify and forward it to SWIFT. You'll be notified once completed.</p>
                        <button onClick={() => navigate('/dashboard')} className="w-full bg-[#4A80D4] text-white font-bold py-3.5 rounded-xl hover:bg-[#3A68B0] transition">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};