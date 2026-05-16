// src/pages/employee/EmployeeSupport.jsx
import React from 'react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { Phone, Mail, MessageSquare, ChevronRight, Shield } from 'lucide-react';

const IT_CONTACTS = [
    { id: 'phone', icon: <Phone size={28} />, title: 'IT Helpdesk',     detail: '0800 999 111 · 24/7 support line' },
    { id: 'email', icon: <Mail size={28} />,  title: 'Email IT',        detail: 'it.support@globalpay.co.za' },
    { id: 'chat',  icon: <MessageSquare size={28} />, title: 'Internal Chat', detail: 'Teams: #it-support channel' },
];

const FAQ_ITEMS = [
    { id: 'reset',    q: 'How do I reset my employee password?' },
    { id: 'vpn',      q: 'How do I connect to the corporate VPN?' },
    { id: 'access',   q: 'How do I request access to additional systems?' },
    { id: 'incident', q: 'How do I report a security incident?' },
    { id: 'mfa',      q: 'How do I set up multi-factor authentication?' },
];

export const EmployeeSupport = () => (
    <EmployeeLayout title="IT Support">
        <div className="max-w-4xl space-y-6">

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <Shield size={18} className="text-red-600 shrink-0" />
                <p className="text-xs text-red-700 font-semibold">
                    For security incidents, contact IT immediately via phone. Do not email sensitive incident details.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {IT_CONTACTS.map((c) => (
                    <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition cursor-pointer">
                        <div className="text-red-600 mb-3">{c.icon}</div>
                        <h3 className="font-bold text-gray-800 mb-1">{c.title}</h3>
                        <p className="text-xs text-gray-500">{c.detail}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-6">Staff FAQs</h3>
                <div className="space-y-2">
                    {FAQ_ITEMS.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition rounded-xl">
                            <p className="text-sm font-medium text-gray-700">{item.q}</p>
                            <ChevronRight size={16} className="text-gray-400 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </EmployeeLayout>
);