// src/pages/employee/EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { ClipboardCheck, Clock, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';

const empFetch = async (url, options = {}) => {
    const token = localStorage.getItem('empToken');
    const res   = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    });
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('empToken');
        localStorage.removeItem('employee');
        window.location.href = '/employee/login?reason=session_expired';
        return null;
    }
    return res;
};

export const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await empFetch('https://localhost:5000/api/employee/payments');
            if (!res) return;
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
            setLoading(false);
        };
        load();
    }, []);

    const pending  = payments.filter((p) => p.status === 'Pending').length;
    const verified = payments.filter((p) => p.status === 'Verified').length;
    const rejected = payments.filter((p) => p.status === 'Rejected').length;
    const submitted= payments.filter((p) => p.status === 'Submitted to SWIFT').length;

    const stats = [
        { label: 'Awaiting Verification', value: pending,   icon: <Clock size={22} className="text-orange-500" />, bg: 'bg-orange-50' },
        { label: 'Verified',              value: verified,  icon: <CheckCircle size={22} className="text-green-500" />, bg: 'bg-green-50' },
        { label: 'Rejected',              value: rejected,  icon: <XCircle size={22} className="text-red-500" />, bg: 'bg-red-50' },
        { label: 'Submitted to SWIFT',    value: submitted, icon: <Send size={22} className="text-blue-500" />, bg: 'bg-blue-50' },
    ];

    return (
        <EmployeeLayout title="Employee Dashboard">
            <div className="space-y-6 max-w-5xl">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                                {s.icon}
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{loading ? '—' : s.value}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Pending alert banner */}
                {!loading && pending > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-orange-500 shrink-0" />
                            <div>
                                <p className="font-bold text-orange-800 text-sm">
                                    {pending} transaction{pending > 1 ? 's' : ''} awaiting verification
                                </p>
                                <p className="text-orange-600 text-xs mt-0.5">
                                    Review payee details and verify the SWIFT code before approving.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/employee/payments')}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shrink-0"
                        >
                            Review Now →
                        </button>
                    </div>
                )}

                {/* Recent activity */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>

                    {loading && (
                        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    )}

                    {!loading && payments.length === 0 && (
                        <div className="bg-white rounded-3xl p-10 text-center text-gray-400 border border-gray-100">
                            <ClipboardCheck size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No transactions in the system yet.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {!loading && payments.slice(0, 5).map((p) => (
                            <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500">
                                        {p.userId?.fullName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{p.userId?.fullName || 'Customer'}</p>
                                        <p className="text-xs text-gray-400">
                                            → {p.payeeName} · <span className="font-mono">{p.swiftCode}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800 text-sm">
                                        {p.currency} {Number(p.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </p>
                                    <StatusBadge status={p.status} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {!loading && payments.length > 5 && (
                        <button
                            onClick={() => navigate('/employee/payments')}
                            className="mt-4 w-full text-center text-xs font-bold text-red-600 hover:underline"
                        >
                            View all {payments.length} transactions →
                        </button>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Pending':           'bg-orange-100 text-orange-700',
        'Verified':          'bg-green-100 text-green-700',
        'Rejected':          'bg-red-100 text-red-600',
        'Submitted to SWIFT':'bg-blue-100 text-blue-700',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
};