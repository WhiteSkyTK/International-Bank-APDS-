import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { SecurityPatterns } from '../../utils/security';

// ✅ FIX: Moved Field component OUTSIDE to stop the focus loss bug
const Field = ({ label, name, placeholder, type = 'text', value, onChange, error, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
        {children || (
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`bg-[#F4F8FE] border rounded-xl py-3 px-4 text-sm font-medium outline-none transition
                    ${error
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-transparent focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20'
                    }`}
            />
        )}
        {error && <p className="text-red-500 text-xs font-semibold mt-0.5">{error}</p>}
    </div>
);

export const MakePayment = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'ZAR',
        payeeName: '',
        payeeAccount: '',
        swiftCode: ''
    });

    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newBalance, setNewBalance] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedToken = localStorage.getItem('token');
        if (!storedUser || !storedToken) {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        setToken(storedToken);
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!SecurityPatterns.amount.test(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Enter a valid positive amount.';
        }
        if (!SecurityPatterns.name.test(formData.payeeName)) {
            newErrors.payeeName = 'Payee name must be letters only.';
        }
        if (!SecurityPatterns.accountNumber.test(formData.payeeAccount)) {
            newErrors.payeeAccount = 'Account number must be 8–12 digits.';
        }
        if (!SecurityPatterns.swiftCode.test(formData.swiftCode)) {
            newErrors.swiftCode = 'Invalid SWIFT code format.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!validate() || !user) return;
        setLoading(true);
        try {
            const response = await fetch('https://localhost:5000/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    payeeName: formData.payeeName,
                    payeeAccount: formData.payeeAccount,
                    swiftCode: formData.swiftCode
                })
            });
            const data = await response.json();
            if (response.ok) {
                const updatedUser = { ...user, balance: data.newBalance };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setNewBalance(data.newBalance);
                setShowModal(true);
            } else {
                setGlobalError(data.error || 'Payment failed.');
            }
        } catch (err) {
            setGlobalError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const currencies = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

    return (
        <DashboardLayout title="Make International Payment">
            <form onSubmit={handlePayment} className="space-y-6 max-w-3xl">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">💳 Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field 
                            label="Amount" 
                            name="amount" 
                            type="number" 
                            value={formData.amount} 
                            onChange={handleChange} 
                            error={errors.amount} 
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="bg-[#F4F8FE] border border-transparent rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20 transition"
                            >
                                {currencies.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">🏦 Payee / Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Payee Full Name" name="payeeName" value={formData.payeeName} onChange={handleChange} error={errors.payeeName} />
                        <Field label="Payee Account Number" name="payeeAccount" value={formData.payeeAccount} onChange={handleChange} error={errors.payeeAccount} />
                        <Field label="SWIFT / BIC Code" name="swiftCode" error={errors.swiftCode}>
                            <input
                                name="swiftCode"
                                type="text"
                                value={formData.swiftCode}
                                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
                                maxLength={11}
                                className={`bg-[#F4F8FE] border rounded-xl py-3 px-4 text-sm font-medium outline-none transition uppercase
                                    ${errors.swiftCode ? 'border-red-400' : 'border-transparent focus:border-[#4A80D4]'}`}
                            />
                        </Field>
                        <div className="flex flex-col gap-1">
                             <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Provider</label>
                             <div className="bg-[#F4F8FE] py-3 px-4 rounded-xl text-sm font-bold text-[#1C4382]">🌐 SWIFT</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/dashboard')} className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-gray-100">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-[#4A80D4] shadow-lg">
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted!</h2>
                        <p className="text-gray-500 text-sm mb-2">Your SWIFT transfer has been queued.</p>
                        {newBalance !== null && (
                            <p className="text-[#1C4382] font-bold text-lg mb-6">
                                New Balance: R {newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-[#4A80D4] hover:bg-[#3A68B0] text-white py-3 rounded-xl font-bold transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};