import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ArrowUpRight } from 'lucide-react';
import { secureFetch } from '../../utils/secureFetch';

export const Overview = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [recentTx, setRecentTx]       = useState([]);
    const [txLoading, setTxLoading]     = useState(true);
    const [txError, setTxError]         = useState('');

    // Fetch the last 3 transactions for the "Recent Transactions" strip
    useEffect(() => {
        if (!user.id) return;

        const fetch3 = async () => {
            setTxLoading(true);
            try {
                const res = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`);
                if (!res) return; // secureFetch already redirected on 401/403
                if (!res.ok) throw new Error('Failed to load transactions.');
                const data = await res.json();
                setRecentTx(data.slice(0, 3)); // show latest 3
            } catch (err) {
                setTxError('Could not load recent transactions.');
            } finally {
                setTxLoading(false);
            }
        };
        fetch3();
    }, [user.id]);

    // ── Download Statement as CSV ──────────────────────────────────────────
    const downloadStatement = async () => {
        try {
            const res = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`);
            if (!res) return;
            const data = await res.json();

            if (!data.length) {
                alert('No transactions to export yet.');
                return;
            }

            // Build CSV
            const headers = ['Date', 'Payee Name', 'Payee Account', 'SWIFT Code', 'Currency', 'Amount (Debit)', 'Status'];
            const rows = data.map((tx) => [
                new Date(tx.createdAt).toLocaleString('en-ZA'),
                tx.payeeName,
                tx.payeeAccount,
                tx.swiftCode,
                tx.currency || 'ZAR',
                `-${tx.amount.toFixed(2)}`,
                tx.status
            ]);

            const csv = [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(','))
                .join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href      = url;
            link.download  = `GlobalPay_Statement_${user.accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            alert('Could not generate statement. Please try again.');
        }
    };

    const statusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified':  return 'bg-green-100 text-green-700';
            case 'rejected':  return 'bg-red-100 text-red-600';
            default:          return 'bg-orange-100 text-orange-600';
        }
    };

    return (
        <DashboardLayout title="Dashboard Overview">
            <div className="space-y-6">

                {/* ── Balance Card ── */}
                <div className="bg-[#1C4382] rounded-[2rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-60">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute right-40 -bottom-20 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

                    <div>
                        <p className="text-blue-200 font-medium text-sm mb-1">Available Balance</p>
                        <h3 className="text-4xl lg:text-5xl font-bold tracking-tight">
                            R {(user.balance ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-12 gap-y-2 text-white z-10">
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Account Number</p>
                            <p className="font-bold tracking-widest text-sm">···· ···· {user.accountNumber?.slice(-4) || '????'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Account Type</p>
                            <p className="font-bold text-sm">Cheque Account</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Branch Code</p>
                            <p className="font-bold text-sm">250655</p>
                        </div>
                    </div>

                    <div className="absolute right-6 bottom-6 flex gap-3">
                        <button
                            onClick={() => navigate('/payment')}
                            className="bg-white text-[#1C4382] px-5 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition text-sm"
                        >
                            + Make Payment
                        </button>
                        <button
                            onClick={downloadStatement}
                            className="bg-white/10 border border-white/20 px-5 py-2.5 rounded-full font-bold hover:bg-white/20 transition flex items-center gap-2 text-sm"
                        >
                            <Download size={14} /> Download Statement
                        </button>
                    </div>
                </div>

                {/* ── Quick Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Sent This Month', value: recentTx.reduce((s, t) => s + (t.amount || 0), 0) },
                        { label: 'Transactions',    value: null, count: recentTx.length },
                        { label: 'Pending',         value: null, count: recentTx.filter((t) => t.status === 'Pending').length },
                        { label: 'Exchange Rate',   value: null, raw: '$ 18.24' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <p className="text-gray-400 text-[11px] font-medium mb-1 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-800">
                                {stat.raw
                                    ? stat.raw
                                    : stat.count !== undefined
                                        ? stat.count
                                        : `R ${stat.value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Recent Transactions ── */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                        <button
                            onClick={() => navigate('/transactions')}
                            className="text-xs font-bold text-[#4A80D4] hover:underline"
                        >
                            View All →
                        </button>
                    </div>

                    {txLoading && (
                        <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    )}

                    {txError && !txLoading && (
                        <p className="text-red-500 text-xs font-semibold p-4 bg-red-50 rounded-2xl border border-red-100">
                            {txError}
                        </p>
                    )}

                    {!txLoading && !txError && recentTx.length === 0 && (
                        <div className="bg-white rounded-3xl p-8 text-center text-gray-400 border border-gray-100">
                            <p className="text-2xl mb-2">📭</p>
                            <p className="text-sm font-medium">No transactions yet.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {!txLoading && recentTx.map((tx) => (
                            <div
                                key={tx._id}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center">
                                        <ArrowUpRight size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-gray-800 text-sm">{tx.payeeName}</p>
                                            <span className="bg-blue-50 text-[#4A80D4] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {tx.swiftCode}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            {new Date(tx.createdAt).toLocaleString('en-ZA', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-500">
                                        -{tx.currency || 'R'} {tx.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};