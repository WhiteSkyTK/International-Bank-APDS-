import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const Transactions = () => {
    // Mock Data based on your Figma screenshot
    const txns = [
        { name: "Jane Doe - Deutsche Bank", desc: "International SWIFT", date: "24 Mar 2026", amount: "-R 5,000", status: "Pending", code: "DEUTDEDB", out: true },
        { name: "Salary — Employer Ltd", desc: "Direct Deposit", date: "20 Mar 2026", amount: "+R 35,000", status: "Complete", out: false },
        { name: "Barclays UK", desc: "International SWIFT", date: "18 Mar 2026", amount: "-R 5,000", status: "Verified", code: "BARCGB22", out: true },
        { name: "Commonwealth AU", desc: "International SWIFT", date: "14 Mar 2026", amount: "-R 5,000", status: "Verified", code: "CTBAAU2S", out: true },
        { name: "Transfer In", desc: "Local Transfer", date: "10 Mar 2026", amount: "+R 10,000", status: "Complete", out: false }
    ];

    const getStatusColor = (status) => {
        if (status === 'Pending') return 'bg-orange-100 text-orange-600';
        if (status === 'Verified') return 'bg-green-100 text-green-700';
        return 'bg-emerald-100 text-emerald-700';
    };

    return (
        <DashboardLayout title="Transaction History">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-4">
                    {txns.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${t.out ? 'bg-red-50' : 'bg-green-50'}`}>
                                    <span className="text-xl">{t.out ? '📤' : '📥'}</span>
                                </div>
                                {/* Details */}
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-gray-800 text-base">{t.name}</p>
                                        {t.code && <span className="bg-blue-50 text-[#4A80D4] text-[10px] font-bold px-2 py-0.5 rounded-full">{t.code}</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">{t.date} · {t.desc}</p>
                                </div>
                            </div>
                            {/* Amount & Status */}
                            <div className="text-right">
                                <p className={`font-bold text-lg ${t.out ? 'text-red-500' : 'text-green-500'}`}>{t.amount}</p>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getStatusColor(t.status)}`}>{t.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};