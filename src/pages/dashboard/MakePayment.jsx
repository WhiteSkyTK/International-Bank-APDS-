import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search } from 'lucide-react';
import { SecurityPatterns } from '../../utils/security';
import { secureFetch } from '../../utils/secureFetch';
import { SWIFT_CODES, CURRENCIES } from '../../utils/swiftCodes';

// ── Field component defined OUTSIDE to prevent focus-loss on re-render ──────
const Field = ({ label, name, placeholder, type = 'text', value, onChange, error }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
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
        {error && <p className="text-red-500 text-xs font-semibold mt-0.5">{error}</p>}
    </div>
);

export const MakePayment = () => {
    const navigate = useNavigate();
    const [user, setUser]   = useState(null);
    const [token, setToken] = useState('');

    const [formData, setFormData] = useState({
        amount:      '',
        currency:    'ZAR',
        payeeName:   '',
        payeeAccount:'',
        swiftCode:   ''
    });

    const [errors, setErrors]           = useState({});
    const [globalError, setGlobalError] = useState('');
    const [showModal, setShowModal]     = useState(false);
    const [newBalance, setNewBalance]   = useState(null);
    const [loading, setLoading]         = useState(false);

    // SWIFT picker state
    const [swiftSearch, setSwiftSearch] = useState('');
    const [showSwiftPicker, setShowSwiftPicker] = useState(false);

    useEffect(() => {
        const storedUser  = JSON.parse(localStorage.getItem('user'));
        const storedToken = localStorage.getItem('token');
        if (!storedUser || !storedToken) { navigate('/login'); return; }
        setUser(storedUser);
        setToken(storedToken);
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const selectSwift = (entry) => {
        setFormData((prev) => ({ ...prev, swiftCode: entry.code }));
        setErrors((prev) => ({ ...prev, swiftCode: '' }));
        setShowSwiftPicker(false);
        setSwiftSearch('');
    };

    const validate = () => {
        const e = {};
        if (!SecurityPatterns.amount.test(formData.amount) || parseFloat(formData.amount) <= 0)
            e.amount = 'Enter a valid positive amount (e.g. 1500.00).';
        if (!SecurityPatterns.name.test(formData.payeeName))
            e.payeeName = 'Payee name: letters only, 2–50 chars.';
        if (!SecurityPatterns.accountNumber.test(formData.payeeAccount))
            e.payeeAccount = 'Account number must be 8–12 digits.';
        if (!SecurityPatterns.swiftCode.test(formData.swiftCode))
            e.swiftCode = 'SWIFT code must be 8–11 uppercase letters/digits.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setGlobalError('');
        if (!validate() || !user) return;

        setLoading(true);
        try {
            const res = await secureFetch('https://localhost:5000/api/pay', {
                method: 'POST',
                body: JSON.stringify({
                    userId:       user.id,
                    amount:       parseFloat(formData.amount),
                    currency:     formData.currency,
                    payeeName:    formData.payeeName,
                    payeeAccount: formData.payeeAccount,
                    swiftCode:    formData.swiftCode
                })
            });
            if (!res) return; // auto-logged out by secureFetch

            const data = await res.json();
            if (res.ok) {
                const updatedUser = { ...user, balance: data.newBalance };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setNewBalance(data.newBalance);
                setShowModal(true);
            } else {
                setGlobalError(data.error || 'Payment failed. Please try again.');
            }
        } catch {
            setGlobalError('Cannot reach the server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Filtered SWIFT list based on search
    const filteredSwift = SWIFT_CODES.filter(
        (s) =>
            s.code.includes(swiftSearch.toUpperCase()) ||
            s.bank.toLowerCase().includes(swiftSearch.toLowerCase()) ||
            s.country.toLowerCase().includes(swiftSearch.toLowerCase())
    );

    const selectedCurrency = CURRENCIES.find((c) => c.code === formData.currency) || CURRENCIES[0];

    return (
        <DashboardLayout title="Make International Payment">
            <form onSubmit={handlePayment} className="space-y-6 max-w-3xl">

                {/* ── Payment Amount & Currency ── */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6">💳 Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field
                            label="Amount"
                            name="amount"
                            type="number"
                            placeholder="e.g. 5000.00"
                            value={formData.amount}
                            onChange={handleChange}
                            error={errors.amount}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Currency
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="bg-[#F4F8FE] border border-transparent rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20 transition"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.flag}  {c.code} — {c.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Sending in: {selectedCurrency.flag} {selectedCurrency.code} ({selectedCurrency.name})
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Payee Details ── */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-6">🏦 Payee / Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field
                            label="Payee Full Name"
                            name="payeeName"
                            placeholder="e.g. Jane Doe"
                            value={formData.payeeName}
                            onChange={handleChange}
                            error={errors.payeeName}
                        />
                        <Field
                            label="Payee Account Number"
                            name="payeeAccount"
                            placeholder="8–12 digits"
                            value={formData.payeeAccount}
                            onChange={handleChange}
                            error={errors.payeeAccount}
                        />

                        {/* ── SWIFT Code with picker ── */}
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                SWIFT / BIC Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    name="swiftCode"
                                    type="text"
                                    value={formData.swiftCode}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            swiftCode: e.target.value.toUpperCase()
                                        }));
                                        setErrors((prev) => ({ ...prev, swiftCode: '' }));
                                    }}
                                    placeholder="e.g. DEUTDEDB"
                                    maxLength={11}
                                    className={`flex-grow bg-[#F4F8FE] border rounded-xl py-3 px-4 text-sm font-mono outline-none transition uppercase
                                        ${errors.swiftCode
                                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                            : 'border-transparent focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSwiftPicker((v) => !v)}
                                    className="bg-[#4A80D4] text-white px-3 rounded-xl hover:bg-[#3A68B0] transition flex items-center gap-1 text-xs font-bold"
                                >
                                    <Search size={14} />
                                    Find
                                </button>
                            </div>
                            {errors.swiftCode && (
                                <p className="text-red-500 text-xs font-semibold mt-0.5">{errors.swiftCode}</p>
                            )}

                            {/* SWIFT dropdown picker */}
                            {showSwiftPicker && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
                                    <div className="p-3 border-b border-gray-100">
                                        <input
                                            type="text"
                                            value={swiftSearch}
                                            onChange={(e) => setSwiftSearch(e.target.value)}
                                            placeholder="Search bank, country or code…"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-[#4A80D4]"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                        {filteredSwift.length === 0 ? (
                                            <p className="text-center text-gray-400 text-xs py-6">No matches found.</p>
                                        ) : (
                                            filteredSwift.map((s) => (
                                                <button
                                                    key={s.code}
                                                    type="button"
                                                    onClick={() => selectSwift(s)}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition text-left"
                                                >
                                                    <div>
                                                        <span className="text-xs font-mono font-bold text-[#1C4382]">{s.code}</span>
                                                        <span className="text-xs text-gray-500 ml-2">{s.bank}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{s.flag} {s.country}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Provider</label>
                            <div className="bg-[#F4F8FE] py-3 px-4 rounded-xl text-sm font-bold text-[#1C4382]">
                                🌐 SWIFT — Society for Worldwide Interbank Financial Telecommunication
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 bg-[#EAF2FB] p-4 rounded-2xl">
                    <span className="text-xl mt-0.5">🔒</span>
                    <p className="text-xs text-[#4A6FA5] font-semibold leading-snug">
                        All inputs are validated and sanitised server-side before processing.
                        This payment is protected by 256-bit SSL encryption.
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
                        {loading ? 'Processing…' : 'Pay Now'}
                    </button>
                </div>
            </form>

            {/* ── Success Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted!</h2>
                        <p className="text-gray-500 text-sm mb-2">
                            Your SWIFT transfer has been queued for processing.
                        </p>
                        {newBalance !== null && (
                            <p className="text-[#1C4382] font-bold text-lg mb-6">
                                New Balance: R{' '}
                                {newBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
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