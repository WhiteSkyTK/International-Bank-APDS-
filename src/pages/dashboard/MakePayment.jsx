import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { SecurityPatterns } from '../../utils/security';

export const MakePayment = () => {
    const navigate = useNavigate();

    // Pull the stored user and token once on mount
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear field-level error on change
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    // Validate all fields against whitelisted regex patterns
    const validate = () => {
        const newErrors = {};

        if (!SecurityPatterns.amount.test(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Enter a valid positive amount (e.g. 1500.00).';
        }
        if (!SecurityPatterns.name.test(formData.payeeName)) {
            newErrors.payeeName = 'Payee name must be letters only (2–50 chars).';
        }
        if (!SecurityPatterns.accountNumber.test(formData.payeeAccount)) {
            newErrors.payeeAccount = 'Account number must be 8–12 digits.';
        }
        if (!SecurityPatterns.swiftCode.test(formData.swiftCode)) {
            newErrors.swiftCode = 'SWIFT code must be 8–11 uppercase letters/digits (e.g. DEUTDEDB).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setGlobalError('');

        if (!validate()) return;
        if (!user) return;

        setLoading(true);
        try {
            const response = await fetch('https://localhost:5000/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // FIX: send JWT so server can authenticate the request
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,        // FIX: was localStorage.getItem('userId') which returned null
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    payeeName: formData.payeeName,
                    payeeAccount: formData.payeeAccount,
                    swiftCode: formData.swiftCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update the stored user balance so Overview shows the correct figure
                const updatedUser = { ...user, balance: data.newBalance };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setNewBalance(data.newBalance);
                setShowModal(true);
            } else {
                setGlobalError(data.error || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setGlobalError('Payment failed. Cannot reach secure server.');
        } finally {
            setLoading(false);
        }
    };

    const currencies = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

    const Field = ({ label, name, placeholder, type = 'text', children }) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
            {children || (
                <input
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`bg-[#F4F8FE] border rounded-xl py-3 px-4 text-sm font-medium outline-none transition
                        ${errors[name]
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-transparent focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20'
                        }`}
                />
            )}
            {errors[name] && <p className="text-red-500 text-xs font-semibold mt-0.5">{errors[name]}</p>}
        </div>
    );

    return (
        <DashboardLayout title="Make International Payment">
            <form onSubmit={handlePayment} className="space-y-6 max-w-3xl">

                {/* Section 1: Amount */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        💳 Payment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Amount" name="amount" placeholder="e.g. 5000.00" type="number" />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="bg-[#F4F8FE] border border-transparent rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20 transition"
                            >
                                {currencies.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Payee Details */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        🏦 Payee / Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Payee Full Name" name="payeeName" placeholder="e.g. Jane Doe" />
                        <Field label="Payee Account Number" name="payeeAccount" placeholder="8–12 digits" />
                        <Field
                            label="SWIFT / BIC Code"
                            name="swiftCode"
                            placeholder="e.g. DEUTDEDB"
                        >
                            <input
                                name="swiftCode"
                                type="text"
                                value={formData.swiftCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })
                                }
                                placeholder="e.g. DEUTDEDB"
                                maxLength={11}
                                className={`bg-[#F4F8FE] border rounded-xl py-3 px-4 text-sm font-medium outline-none transition uppercase
                                    ${errors.swiftCode
                                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                        : 'border-transparent focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20'
                                    }`}
                            />
                            {errors.swiftCode && (
                                <p className="text-red-500 text-xs font-semibold mt-0.5">{errors.swiftCode}</p>
                            )}
                        </Field>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Provider</label>
                            <div className="bg-[#F4F8FE] border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-[#1C4382]">
                                🌐 SWIFT
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">
                                GlobalPay uses SWIFT for all international transfers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security notice */}
                <div className="flex items-center gap-3 bg-[#EAF2FB] p-4 rounded-2xl">
                    <ShieldCheck size={20} className="text-[#4A80D4] shrink-0" />
                    <p className="text-xs text-[#4A6FA5] font-semibold leading-snug">
                        All inputs are validated and sanitised before transmission.
                        Your payment is protected by 256-bit SSL encryption.
                    </p>
                </div>

                {globalError && (
                    <p className="text-red-500 text-xs font-bold p-3 bg-red-50 border border-red-200 rounded-xl">
                        {globalError}
                    </p>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-[#4A80D4] hover:bg-[#3A68B0] shadow-lg disabled:opacity-60 transition"
                    >
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