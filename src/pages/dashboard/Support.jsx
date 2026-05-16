// src/pages/dashboard/Support.jsx
import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Phone, MessageSquare, Mail, ChevronRight } from 'lucide-react';

const FAQ_ITEMS = [
    { id: 'swift-time',    q: 'How long does an international SWIFT payment take?' },
    { id: 'swift-code',    q: 'What is a SWIFT / BIC code and how do I find it?' },
    { id: 'daily-limit',   q: 'What are the daily limits for international transfers?' },
    { id: 'suspicious',    q: 'How do I report a suspicious transaction?' },
    { id: 'cancel',        q: 'Can I cancel a payment after clicking Pay Now?' },
];

export const Support = () => (
    <DashboardLayout title="Support & Contact">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
                { icon: <Phone size={32} />,         title: 'Call Us',        detail: '0800 123 456 · Mon–Fri 8am–6pm' },
                { icon: <MessageSquare size={32} />, title: 'Live Chat',      detail: 'Chat with an agent via our secure portal' },
                { icon: <Mail size={32} />,          title: 'Email Support',  detail: 'support@globalpay.co.za · Response within 24hrs' },
            ].map((item) => (
                // FIX: unique key using title
                <div key={item.title} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition">
                    <div className="text-gray-700 mb-3">{item.icon}</div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
            ))}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-2">
                {FAQ_ITEMS.map((item) => (
                    // FIX: unique id key
                    <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition">
                        <p className="text-sm font-medium text-gray-700">{item.q}</p>
                        <ChevronRight size={18} className="text-gray-400" />
                    </div>
                ))}
            </div>
        </div>
    </DashboardLayout>
);