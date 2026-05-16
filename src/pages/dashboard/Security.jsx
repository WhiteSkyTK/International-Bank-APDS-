// src/pages/dashboard/Security.jsx
import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShieldCheck, CheckSquare } from 'lucide-react';

// FIX: unique string keys instead of array index
const PROTOCOLS = [
    { id: 'ssl',     title: '256-bit SSL Encryption',    desc: 'All traffic encrypted in transit · TLS 1.3' },
    { id: 'bcrypt',  title: 'Password Hashing (bcrypt)', desc: 'Salted & hashed — never stored in plain text · salt rounds: 12' },
    { id: 'session', title: 'Session Security',          desc: 'JWT tokens · Auto-expire after 90s inactivity' },
    { id: 'click',   title: 'Clickjacking Protection',   desc: 'X-Frame-Options: DENY enforced via Helmet' },
    { id: 'xss',     title: 'XSS Protection',            desc: 'X-Content-Type-Options: nosniff · Content-Security-Policy' },
    { id: 'regex',   title: 'Input Whitelisting',        desc: 'All inputs validated with strict RegEx patterns' },
    { id: 'rate',    title: 'Rate Limiting',              desc: 'Max 5 login attempts per 15 min (express-rate-limit)' },
    { id: 'idor',    title: 'IDOR Protection',            desc: 'JWT user ID matched against every requested resource' },
];

export const Security = () => (
    <DashboardLayout title="Security Settings">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 max-w-4xl">
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3 border-b pb-6">
                <ShieldCheck size={28} className="text-[#4A80D4]" /> Security Overview
            </h3>
            <div className="space-y-4">
                {PROTOCOLS.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                <CheckSquare className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{p.title}</p>
                                <p className="text-xs text-gray-500 font-medium">{p.desc}</p>
                            </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase">Active</span>
                    </div>
                ))}
            </div>
        </div>
    </DashboardLayout>
);