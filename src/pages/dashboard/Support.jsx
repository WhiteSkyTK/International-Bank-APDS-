import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Phone, MessageSquare, Mail, ChevronRight } from 'lucide-react';

export const Support = () => {
    return (
        <DashboardLayout title="Support & Contact">
            {/* Top Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition">
                    <Phone size={32} className="text-gray-700 mb-3"/>
                    <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                    <p className="text-xs text-gray-500">0800 123 456 · Available Mon–Fri<br/>8am–6pm</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition">
                    <MessageSquare size={32} className="text-gray-700 mb-3"/>
                    <h3 className="font-bold text-gray-800 mb-1">Live Chat</h3>
                    <p className="text-xs text-gray-500">Chat with an agent in real time<br/>via our secure portal</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition">
                    <Mail size={32} className="text-gray-700 mb-3"/>
                    <h3 className="font-bold text-gray-800 mb-1">Email Support</h3>
                    <p className="text-xs text-gray-500">support@globalpay.co.za ·<br/>Response within 24hrs</p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-2">
                    {[
                        "How long does an international SWIFT payment take?",
                        "What is a SWIFT / BIC code and how do I find it?",
                        "What are the daily limits for international transfers?",
                        "How do I report a suspicious transaction?",
                        "Can I cancel a payment after clicking Pay Now?"
                    ].map((q, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition">
                            <p className="text-sm font-medium text-gray-700">{q}</p>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};