import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';
import { secureFetch } from '../../utils/secureFetch';

export const Transactions = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchHistory = async () => {
        if (!user?.id) { navigate('/login'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`);
            if (!res) return; // secureFetch handled 401 redirect

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to load transactions.');
            }
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            setError(err.message || 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const statusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified':  return 'bg-green-100 text-green-700';
            case 'rejected':  return 'bg-red-100   text-red-600';
            default:          return 'bg-orange-100 text-orange-600';
        }
    };

    return (
        <DashboardLayout title="Transaction History">
            <div className="max-w-4xl space-y-4">

                {/* Header row */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 font-medium">
                        {!loading && !error && `${history.length} transaction${history.length !== 1 ? 's' : ''} found`}
                    </p>
                    <button
                        onClick={fetchHistory}
                        className="flex items-center gap-2 text-xs font-bold text-[#4A80D4] hover:underline"
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm font-medium">Loading transactions…</span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-5 rounded-2xl">
                        <p>{error}</p>
                        <button onClick={fetchHistory} className="mt-2 text-xs underline">
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <span className="text-5xl">📭</span>
                        <p className="font-semibold text-sm">No transactions yet.</p>
                        <button
                            onClick={() => navigate('/payment')}
                            className="mt-2 bg-[#4A80D4] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#3A68B0] transition"
                        >
                            Make your first payment
                        </button>
                    </div>
                )}

                {/* Transaction list */}
                {!loading && !error && history.map((tx) => (
                    <div
                        key={tx._id}
                        className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
                    >
                        {/* Left */}
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-[#4A80D4] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                <ArrowUpRight size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-bold text-gray-800">{tx.payeeName}</p>
                                <p className="text-xs text-gray-500 font-mono">
                                    To: {tx.payeeAccount}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <span className="bg-blue-50 text-[#4A80D4] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                        {tx.swiftCode}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(tx.createdAt).toLocaleString('en-ZA', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                            <p className="font-bold text-lg text-red-500">
                                -{tx.currency || 'R'}{' '}
                                {Number(tx.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </p>
                            <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${statusStyle(tx.status)}`}>
                                {tx.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};