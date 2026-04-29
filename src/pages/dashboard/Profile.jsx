import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShieldCheck, Eye, EyeOff, Copy, Check } from 'lucide-react';

// ── Reusable masked field with reveal toggle ─────────────────────────────────
const MaskedField = ({ label, value, mask, copyable = false }) => {
    const [visible, setVisible]   = useState(false);
    const [copied,  setCopied]    = useState(false);

    const displayValue = visible ? value : mask;

    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 font-mono tracking-wider text-sm">
                    {displayValue}
                </p>
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="text-gray-400 hover:text-[#4A80D4] transition"
                    title={visible ? 'Hide' : 'Show'}
                >
                    {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                {copyable && visible && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-green-500 transition"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Plain visible field ───────────────────────────────────────────────────────
const PlainField = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="font-bold text-gray-800 text-sm">{value || '—'}</p>
    </div>
);

export const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Mask helpers
    const maskAccount = (acc) =>
        acc ? `${'•'.repeat(acc.length - 4)} ${acc.slice(-4)}` : '••••••••';
    const maskId = (id) =>
        id ? `${'•'.repeat(id.length - 4)}${id.slice(-4)}` : '•••••••••••••';

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-4xl space-y-6">

                {/* ── Header card ── */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
                        <div className="w-20 h-20 bg-[#1C4382] text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg select-none">
                            {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.fullName || 'User'}</h2>
                            <p className="text-sm text-gray-500 mb-2">Personal Banking Account</p>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                <ShieldCheck size={13} /> KYC Verified
                            </span>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
                        <PlainField  label="Full Name"    value={user.fullName} />
                        <PlainField  label="Username"     value={user.username || user.fullName?.split(' ')[0].toLowerCase()} />
                        <MaskedField
                            label="ID Number"
                            value={user.idNumber || '0000000000000'}
                            mask={maskId(user.idNumber)}
                            copyable
                        />
                    </div>
                </div>

                {/* ── Account Details ── */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Account Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
                        <MaskedField
                            label="Account Number"
                            value={user.accountNumber || ''}
                            mask={maskAccount(user.accountNumber)}
                            copyable
                        />
                        <PlainField label="Account Type"  value="Cheque Account" />
                        <PlainField label="Branch Code"   value="250655" />
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available Balance</p>
                            <p className="font-bold text-[#1C4382] text-xl">
                                R {(user.balance ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <PlainField label="Internal User ID" value={user.id?.slice(-10).toUpperCase() || '—'} />
                        <PlainField label="Account Status"   value="Active" />
                    </div>
                </div>

                {/* ── Security Status ── */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Security Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Password Hashing',  detail: 'bcrypt · salt rounds: 12',           status: 'Active' },
                            { label: 'SSL Encryption',    detail: '256-bit TLS 1.3',                     status: 'Active' },
                            { label: 'Session Timeout',   detail: 'Auto-logout after 90s inactivity',    status: 'Active' },
                            { label: 'Input Whitelisting',detail: 'All fields validated via RegEx',       status: 'Active' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{item.detail}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};