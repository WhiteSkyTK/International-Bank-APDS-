import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, History, Send, User, MessageSquare, ShieldCheck, LogOut } from 'lucide-react';

const NavItem = ({ icon, label, active, count }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition cursor-pointer font-medium ${active ? 'bg-white text-[#1C4382] shadow-lg' : 'hover:bg-white/5 text-blue-100/70 hover:text-white'}`}>
        {icon} <span>{label}</span>
        {count && <span className="ml-auto bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>}
    </div>
);

const StatCard = ({ icon, label, value, sub }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">{icon}</div>
        <p className="text-gray-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
);

export const Dashboard = () => {
    const navigate = useNavigate();
    
    return (
        <div className="flex h-screen bg-[#E5E7EB] font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-[#1C4382] text-white flex flex-col p-6 shadow-xl z-20 hidden md:flex">
                <h1 className="text-2xl font-bold mb-10 tracking-tighter">GLOBALPAY</h1>
                <div className="flex items-center gap-4 mb-12 bg-white/10 p-3 rounded-2xl">
                    <div className="w-12 h-12 bg-white text-[#1C4382] rounded-full flex items-center justify-center font-bold text-xl shadow-lg">JS</div>
                    <div>
                        <p className="font-bold text-sm leading-none mb-1">John Smith</p>
                        <p className="text-xs text-blue-200 opacity-70">Personal Account</p>
                    </div>
                </div>
                <nav className="flex-grow space-y-2">
                    <NavItem icon={<History size={20}/>} label="Overview" active />
                    <NavItem icon={<Send size={20}/>} label="Make Payment" />
                    <NavItem icon={<History size={20}/>} label="Transactions" count="3" />
                </nav>
                <button onClick={() => navigate('/login')} className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 transition font-bold">
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <div className="flex items-center gap-6">
                        <Bell className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-500">25 Mar 2026</p>
                    </div>
                </header>
                <main className="p-6 md:p-10 overflow-y-auto space-y-8">
                    {/* Main Balance Card */}
                    <div className="bg-gradient-to-br from-[#1C4382] to-[#4A80D4] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <p className="text-blue-100 text-lg mb-2">Available Balance</p>
                        <h3 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">R 84,250.00</h3>
                        <div className="absolute right-10 bottom-10 flex gap-4 hidden md:flex">
                            <button className="bg-white text-[#1C4382] px-6 py-3 rounded-2xl font-bold shadow-lg">+ Make Payment</button>
                            <button className="bg-white/20 border border-white/30 px-6 py-3 rounded-2xl font-bold backdrop-blur-sm">Download Statement</button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard icon={<History className="text-blue-500"/>} label="Sent This Month" value="R 12,400" sub="4 Transaction" />
                        <StatCard icon={<History className="text-green-500"/>} label="Received" value="R 5,000" sub="2 Transaction" />
                        <StatCard icon={<History className="text-amber-500"/>} label="Pending" value="2" sub="Awaiting SWIFT" />
                        <StatCard icon={<History className="text-gray-500"/>} label="Exchange Rate" value="$ 17.34" sub="ZAR / USD Today" />
                    </div>
                </main>
            </div>
        </div>
    );
};