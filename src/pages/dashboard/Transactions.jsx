import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { secureFetch } from '../../utils/secureFetch'; // Added secureFetch import
import { ArrowUpRight, Loader2 } from 'lucide-react';

export const Transactions = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            const userRaw = localStorage.getItem('user');
            const user = userRaw ? JSON.parse(userRaw) : null;

            if (!user?.id) {
                navigate('/login');
                return;
            }

            try {
                // Using your secureFetch wrapper here
                const data = await secureFetch(`https://localhost:5000/api/transactions/${user.id}`, {
                    method: 'GET'
                });

                // secureFetch handles 401/403 auto-logouts, so if it returns null/undefined, we stop
                if (!data) return; 

                setHistory(data);
            } catch (err) {
                setError(err.message || 'Could not reach the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    const statusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified':  return 'bg-green-100 text-green-700';
            case 'rejected':  return 'bg-red-100 text-red-600';
            default:          return 'bg-orange-100 text-orange-600'; // Pending
        }
    };

    return (
        <DashboardLayout title="Transaction History">
            <div className="space-y-4">

                {loading && (
                    <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="font-medium text-sm">Loading transactions…</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-4 rounded-2xl">
                        {error}
                    </div>
                )}

                {!loading && !error && history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <span className="text-5xl">📭</span>
                        <p className="font-medium text-sm">No transactions yet.</p>
                        <button
                            onClick={() => navigate('/payment')}
                            className="mt-2 bg-[#4A80D4] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#3A68B0] transition"
                        >
                            Make your first payment
                        </button>
                    </div>
                )}

                {/* Updated mapping logic for the transaction list */}
                {!loading && !error && history.length > 0 && (
                    <div className="space-y-3">
                        {history.map((tx) => (
                            <div
                                key={tx._id}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-[#4A80D4] rounded-2xl flex items-center justify-center font-bold shadow-sm">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{tx.payeeName || tx.description || 'Transfer'}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            {new Date(tx.createdAt || tx.date).toLocaleString('en-ZA', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                        {tx.swiftCode && (
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                                                SWIFT · {tx.swiftCode}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-1.5">
                                    <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{tx.currency || 'R'} {Number(tx.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${statusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};