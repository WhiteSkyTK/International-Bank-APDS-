// src/pages/employee/EmployeePayments.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { CheckCircle, XCircle, Send, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

// FIX: removed empty object spread, globalThis instead of window
const empFetch = async (url, options = {}) => {
    const token = localStorage.getItem('empToken');
    const { headers: extraHeaders, ...restOptions } = options;
    const res = await fetch(url, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
            ...extraHeaders
        }
    });
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('empToken');
        localStorage.removeItem('employee');
        globalThis.location.href = '/employee/login?reason=session_expired';
        return null;
    }
    return res;
};

const SWIFT_REGEX = /^[A-Z0-9]{8,11}$/;

// FIX: status style as function — avoids negated conditions in JSX
const statusStyle = (s) => {
    if (s === 'Verified')          return 'bg-green-100 text-green-700';
    if (s === 'Rejected')          return 'bg-red-100 text-red-600';
    if (s === 'Submitted to SWIFT') return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700'; // Pending
};

export const EmployeePayments = () => {
    const [payments,      setPayments]      = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');
    const [submitting,    setSubmitting]    = useState(false);
    const [submitMsg,     setSubmitMsg]     = useState('');
    const [actionLoading, setActionLoading] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await empFetch('https://localhost:5000/api/employee/payments');
            if (!res) return;
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Load payments failed:', err.message);
            setError('Could not load payments.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleVerify = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: 'verifying' }));
        const res = await empFetch(`https://localhost:5000/api/employee/payments/${id}/verify`, { method: 'PATCH' });
        if (res?.ok) {
            setPayments((prev) => prev.map((p) => p._id === id ? { ...p, status: 'Verified' } : p));
        }
        setActionLoading((prev) => ({ ...prev, [id]: null }));
    };

    const handleReject = async (id) => {
        // FIX: globalThis.confirm instead of window.confirm
        if (!globalThis.confirm('Reject this payment? The customer will be refunded.')) return;
        setActionLoading((prev) => ({ ...prev, [id]: 'rejecting' }));
        const res = await empFetch(`https://localhost:5000/api/employee/payments/${id}/reject`, { method: 'PATCH' });
        if (res?.ok) {
            setPayments((prev) => prev.map((p) => p._id === id ? { ...p, status: 'Rejected' } : p));
        }
        setActionLoading((prev) => ({ ...prev, [id]: null }));
    };

    const handleSubmitSwift = async () => {
        const verifiedCount = payments.filter((p) => p.status === 'Verified').length;
        if (verifiedCount === 0) { setSubmitMsg('No verified payments to submit.'); return; }
        // FIX: globalThis.confirm
        if (!globalThis.confirm(`Submit ${verifiedCount} verified payment(s) to SWIFT? This cannot be undone.`)) return;
        setSubmitting(true);
        setSubmitMsg('');
        const res = await empFetch('https://localhost:5000/api/employee/submit-swift', { method: 'POST' });
        if (res?.ok) {
            const data = await res.json();
            setSubmitMsg(`✅ ${data.count} payment(s) successfully submitted to SWIFT.`);
            await load();
        } else {
            setSubmitMsg('❌ Submission failed. Please try again.');
        }
        setSubmitting(false);
    };

    const pendingCount  = payments.filter((p) => p.status === 'Pending').length;
    const verifiedCount = payments.filter((p) => p.status === 'Verified').length;

    return (
        <EmployeeLayout title="Verify International Payments">
            <div className="space-y-6 max-w-7xl">

                {/* Action bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4 text-sm">
                        <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-full">{pendingCount} Pending</span>
                        <span className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full">{verifiedCount} Verified</span>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={load}
                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button type="button" onClick={handleSubmitSwift} disabled={submitting || verifiedCount === 0}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition">
                            <Send size={16} />
                            {submitting ? 'Submitting…' : `Submit to SWIFT (${verifiedCount})`}
                        </button>
                    </div>
                </div>

                {submitMsg && (
                    <div className={`p-4 rounded-2xl font-semibold text-sm ${submitMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {submitMsg}
                    </div>
                )}

                {error && <p className="text-red-500 text-sm p-4 bg-red-50 rounded-2xl border border-red-200">{error}</p>}

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                        <strong>Before verifying:</strong> Confirm the payee account number and that the SWIFT/BIC code matches the payee's bank.
                    </p>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm">Loading transactions…</span>
                    </div>
                )}

                {!loading && payments.length === 0 && (
                    <div className="bg-white rounded-3xl p-16 text-center text-gray-400 border border-gray-100">
                        <p className="text-4xl mb-4">📭</p>
                        <p className="font-semibold text-sm">No customer payments in the system yet.</p>
                    </div>
                )}

                {!loading && payments.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['Customer','Payee Name','Payee Account','SWIFT Code','Currency','Amount','Date','Status','Actions'].map((h) => (
                                        <th key={h} className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.map((p) => {
                                    const swiftValid = SWIFT_REGEX.test(p.swiftCode);
                                    const busy       = actionLoading[p._id];
                                    const isPending  = p.status === 'Pending';
                                    const isDone     = p.status === 'Submitted to SWIFT';

                                    // FIX: positive condition — swiftValid ? '' : 'bg-red-50/30'
                                    return (
                                        <tr key={p._id} className={`hover:bg-gray-50/50 transition ${swiftValid ? '' : 'bg-red-50/30'}`}>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-gray-800">{p.userId?.fullName ?? '—'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{p.userId?.accountNumber}</p>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-700">{p.payeeName}</td>
                                            <td className="px-5 py-4 font-mono text-gray-600 text-xs">{p.payeeAccount}</td>
                                            <td className="px-5 py-4">
                                                <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg ${swiftValid ? 'bg-blue-50 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                    {p.swiftCode}
                                                </span>
                                                {/* FIX: positive condition — swiftValid is false → show warning */}
                                                {swiftValid ? null : (
                                                    <p className="text-[9px] text-red-500 mt-0.5">⚠ Invalid format</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-600">{p.currency}</td>
                                            <td className="px-5 py-4 font-bold text-gray-800">
                                                {Number(p.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(p.createdAt).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap ${statusStyle(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {isDone ? (
                                                    <span className="text-[10px] text-gray-400 font-medium">Completed</span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {isPending && (
                                                            <button type="button"
                                                                onClick={() => handleVerify(p._id)}
                                                                disabled={!!busy || !swiftValid}
                                                                title={swiftValid ? 'Verify this payment' : 'Cannot verify — invalid SWIFT code'}
                                                                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                                                                {busy === 'verifying' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                                                Verify
                                                            </button>
                                                        )}
                                                        {(isPending || p.status === 'Verified') && (
                                                            <button type="button"
                                                                onClick={() => handleReject(p._id)}
                                                                disabled={!!busy}
                                                                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                                                                {busy === 'rejecting' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
};