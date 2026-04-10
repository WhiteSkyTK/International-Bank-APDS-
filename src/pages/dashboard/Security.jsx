import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShieldCheck, CheckSquare } from 'lucide-react';

export const Security = () => {
    const protocols = [
        { title: "256-bit SSL Encryption", desc: "All traffic encrypted in transit · TLS 1.3" },
        { title: "Password Hashing (bcrypt)", desc: "Your password is salted & hashed — never stored in plain text" },
        { title: "Session Security", desc: "HttpOnly tokens · Auto-expire after 30 min inactivity" },
        { title: "Clickjacking Protection", desc: "X-Frame-Options: DENY header enforced via Helmet" },
        { title: "Input Whitelisting", desc: "All inputs validated with strict RegEx patterns" }
    ];

    return (
        <DashboardLayout title="Security Settings">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 max-w-4xl">
                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3 border-b pb-6"><ShieldCheck size={28} className="text-red-400"/> Security Overview</h3>
                
                <div className="space-y-4">
                    {protocols.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                    <CheckSquare className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{p.title}</p>
                                    <p className="text-xs text-gray-500 font-medium">{p.desc}</p>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};