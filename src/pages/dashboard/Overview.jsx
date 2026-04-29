import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { secureFetch } from '../../utils/secureFetch';
import { CURRENCIES } from '../../utils/swiftCodes';

// Static exchange rates vs ZAR (update via API in production)
const EXCHANGE_RATES = {
    ZAR: 1, USD: 0.054, EUR: 0.050, GBP: 0.043,
    JPY: 8.12, AUD: 0.083, CAD: 0.074, CHF: 0.048, CNY: 0.39
};

export const Overview = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [recentTx, setRecentTx]   = useState([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError]     = useState('');
    const [selectedCcy, setSelectedCcy] = useState('USD');

    useEffect(() => {
        if (!user.id) return;
        const load = async () => {
            setTxLoading(true);
            try {
                const res = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`);
                if (!res) return;
                if (!res.ok) throw new Error('Failed.');
                const data = await res.json();
                setRecentTx(data.slice(0, 3));
            } catch {
                setTxError('Could not load recent transactions.');
            } finally {
                setTxLoading(false);
            }
        };
        load();
    }, [user.id]);

    // ── CSV download ─────────────────────────────────────────────────────────
    const downloadStatement = async () => {
        try {
            const res = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`);
            if (!res) return;
            const data = await res.json();
            if (!data.length) { alert('No transactions to export yet.'); return; }

            const headers = ['Date','Payee Name','Payee Account','SWIFT Code','Currency','Amount (Debit)','Status'];
            const rows = data.map((tx) => [
                new Date(tx.createdAt).toLocaleString('en-ZA'),
                tx.payeeName, tx.payeeAccount, tx.swiftCode,
                tx.currency || 'ZAR',
                `-${tx.amount.toFixed(2)}`,
                tx.status
            ]);
            const csv = [headers, ...rows]
                .map((r) => r.map((c) => `"${c}"`).join(','))
                .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `GlobalPay_Statement_${user.accountNumber}_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            alert('Could not generate statement.');
        }
    };

    const statusStyle = (s) =>
        s === 'Verified'  ? 'bg-green-100 text-green-700' :
        s === 'Rejected'  ? 'bg-red-100 text-red-600'     :
                            'bg-orange-100 text-orange-600';

    const rate        = EXCHANGE_RATES[selectedCcy] || 1;
    const ccyInfo     = CURRENCIES.find((c) => c.code === selectedCcy) || CURRENCIES[1];
    const balanceFx   = ((user.balance || 0) * rate).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
    const totalSent   = recentTx.reduce((s, t) => s + (t.amount || 0), 0);
    const pendingCount= recentTx.filter((t) => t.status === 'Pending').length;

    return (
        <DashboardLayout title="Dashboard Overview">
            <div className="space-y-6">

                {/* ── Balance Card ── */}
                <div className="bg-[#1C4382] rounded-[2rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden" style={{ minHeight: '15rem' }}>
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute right-40 -bottom-20 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

                    <p className="text-blue-200 font-medium text-sm mb-1">Available Balance</p>
                    <h3 className="text-4xl lg:text-5xl font-bold tracking-tight mb-1">
                        R {(user.balance ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </h3>
                    {/* Live FX conversion */}
                    <p className="text-blue-300 text-sm mb-6">
                        ≈ {ccyInfo.flag} {ccyInfo.symbol}{balanceFx} {selectedCcy}
                    </p>

                    <div className="flex flex-wrap gap-x-10 gap-y-2 text-white text-sm z-10">
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Account Number</p>
                            <p className="font-bold tracking-widest">···· ···· {user.accountNumber?.slice(-4) || '????'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Account Type</p>
                            <p className="font-bold">Cheque Account</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-blue-200 mb-0.5">Branch Code</p>
                            <p className="font-bold">250655</p>
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
                            <Download size={14} /> Statement
                        </button>
                    </div>
                </div>

                {/* ── Stats + Currency Converter ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-gray-400 text-[11px] font-medium mb-1 uppercase">Recent Sent</p>
                        <p className="text-lg font-bold text-gray-800">
                            R {totalSent.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-gray-400 text-[11px] font-medium mb-1 uppercase">Transactions</p>
                        <p className="text-lg font-bold text-gray-800">{recentTx.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-gray-400 text-[11px] font-medium mb-1 uppercase">Pending</p>
                        <p className="text-lg font-bold text-gray-800">{pendingCount}</p>
                    </div>

                    {/* ── Currency selector ── */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-1 mb-2">
                            <TrendingUp size={13} className="text-[#4A80D4]" />
                            <p className="text-gray-400 text-[11px] font-medium uppercase">View Balance In</p>
                        </div>
                        <select
                            value={selectedCcy}
                            onChange={(e) => setSelectedCcy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-bold outline-none focus:border-[#4A80D4] mb-2"
                        >
                            {CURRENCIES.filter((c) => c.code !== 'ZAR').map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 font-medium">
                            1 ZAR = {rate.toFixed(4)} {selectedCcy}
                        </p>
                        <p className="text-sm font-bold text-[#1C4382] mt-1">
                            {ccyInfo.symbol}{balanceFx}
                        </p>
                    </div>
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

                    {!txLoading && txError && (
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
                                    <div className="w-11 h-11 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center shrink-0">
                                        <ArrowUpRight size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-gray-800 text-sm">{tx.payeeName}</p>
                                            <span className="bg-blue-50 text-[#4A80D4] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                                {tx.swiftCode}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(tx.createdAt).toLocaleString('en-ZA', {
                                                day: 'numeric', month: 'short',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-500 text-sm">
                                        -{tx.currency || 'R'} {tx.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle(tx.status)}`}>
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