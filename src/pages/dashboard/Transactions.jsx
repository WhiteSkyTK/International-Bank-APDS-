import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import axios from 'axios';

export const Transactions = () => {
    const [history, setHistory] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchHistory = async () => {
            const res = await axios.get(`https://localhost:5000/api/transactions/${user.id}`);
            setHistory(res.data);
        };
        fetchHistory();
    }, [user.id]);

    return (
        <DashboardLayout title="Transaction History">
            <div className="space-y-4">
                {history.length > 0 ? history.map((tx) => (
                    <div key={tx._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">TX</div>
                            <div>
                                <p className="font-bold text-gray-800">{tx.payeeName}</p>
                                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-red-500">-R {tx.amount.toLocaleString()}</p>
                            <p className="text-[10px] uppercase font-bold text-gray-400">{tx.status}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-10">No transactions found.</p>
                )}
            </div>
        </DashboardLayout>
    );
};