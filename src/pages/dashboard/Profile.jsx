import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShieldCheck } from 'lucide-react';

export const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    return (
        <DashboardLayout title="My Profile">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 max-w-5xl">
                <div className="flex items-center gap-6 mb-8 border-b pb-8">
                    <div className="w-20 h-20 bg-[#1C4382] text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg">
                        {user.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user.fullName || "User"}</h2>
                        <p className="text-sm text-gray-500 mb-1">Personal Banking Account</p>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <ShieldCheck size={14}/> KYC Verified
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                        <p className="font-bold text-gray-800">{user.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">User ID</p>
                        <p className="font-bold text-gray-800">{user.id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Account Number</p>
                        <p className="font-bold text-gray-800">{user.accountNumber || "Generating..."}</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};