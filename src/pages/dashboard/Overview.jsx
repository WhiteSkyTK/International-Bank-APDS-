import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export const Overview = () => {
    const navigate = useNavigate();
    return (
        <DashboardLayout title="Dashboard Overview">
            <div className="space-y-6">
                <div className="bg-[#1C4382] rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-64">
                    {/* Decorative Circles */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full"></div>
                    <div className="absolute right-40 -bottom-20 w-40 h-40 bg-white/5 rounded-full"></div>
                    
                    <div>
                        <p className="text-blue-200 font-medium mb-1">Available Balance</p>
                        <h3 className="text-5xl font-bold tracking-tight">R 84,250.00</h3>
                    </div>
                    
                    <div className="flex gap-16 text-white z-10">
                        <div><p className="text-[11px] text-blue-200 mb-1">Account Number</p><p className="font-bold tracking-widest">**** **** 8818</p></div>
                        <div><p className="text-[11px] text-blue-200 mb-1">Account Type</p><p className="font-bold">Cheque Account</p></div>
                        <div><p className="text-[11px] text-blue-200 mb-1">Branch Code</p><p className="font-bold">250655</p></div>
                    </div>

                    <div className="absolute right-10 bottom-8 flex gap-4">
                        <button onClick={() => navigate('/payment')} className="bg-white text-[#1C4382] px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition">+ Make Payment</button>
                        <button className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-full font-bold hover:bg-white/20 transition">Download Statement</button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Sent This Month', 'Received', 'Pending', 'Exchange Rate'].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <p className="text-gray-400 text-[11px] font-medium mb-1 uppercase">{stat}</p>
                            <p className="text-lg font-bold text-gray-800">{['R 12,400', 'R 5,000', '2', '$ 17.34'][i]}</p>
                        </div>
                    ))}
                </div>

                {/* Add this BELOW the Quick Stats grid in Overview.jsx */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                        <button onClick={() => navigate('/transactions')} className="text-xs font-bold text-[#4A80D4] hover:underline flex items-center">View All →</button>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">📤</div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-gray-800">Jane Doe - Deutsche Bank</p>
                                    <span className="bg-blue-50 text-[#4A80D4] text-[10px] font-bold px-2 py-0.5 rounded-full">DEUTDEDB</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">24 Mar 2026 · International SWIFT</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-red-500">-R 5,000</p>
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};