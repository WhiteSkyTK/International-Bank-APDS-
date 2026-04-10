import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, CreditCard, Send, History, User, MessageSquare, ShieldCheck, LogOut } from 'lucide-react';

export const DashboardLayout = ({ children, title = "Dashboard Overview" }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const NavItem = ({ icon, label, path, count }) => {
        const active = location.pathname === path;
        return (
            <div onClick={() => navigate(path)} className={`flex items-center gap-4 p-4 rounded-2xl transition cursor-pointer font-medium ${active ? 'bg-white text-[#1C4382] shadow-lg' : 'hover:bg-white/5 text-blue-100/70 hover:text-white'}`}>
                {icon} <span>{label}</span>
                {count && <span className="ml-auto bg-[#4A80D4] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#E5E7EB] font-sans">
            {/* Sidebar */}
            <div className="w-64 lg:w-72 bg-[#1C4382] text-white flex flex-col p-4 lg:p-6 shadow-xl z-20 hidden md:flex shrink-0">
                <h1 className="text-2xl font-bold mb-8 tracking-tighter">GLOBALPAY</h1>
                
                <div className="flex items-center gap-4 mb-8 bg-white/10 p-3 rounded-2xl">
                    <div className="w-10 h-10 bg-white text-[#1C4382] rounded-full flex items-center justify-center font-bold text-lg shadow-lg">JS</div>
                    <div>
                        <p className="font-bold text-sm leading-none mb-1">John Smith</p>
                        <p className="text-[10px] text-blue-200 opacity-70 uppercase tracking-wider">Personal Account</p>
                    </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Main</div>
                <nav className="space-y-1 mb-6">
                    <NavItem icon={<CreditCard size={20}/>} label="Overview" path="/dashboard" />
                    <NavItem icon={<Send size={20}/>} label="Make Payment" path="/payment" />
                    <NavItem icon={<History size={20}/>} label="Transactions" path="/transactions" count="3" />
                </nav>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Account</div>
                <nav className="space-y-1 flex-grow">
                    <NavItem icon={<User size={20}/>} label="My Profile" path="/profile" />
                    <NavItem icon={<MessageSquare size={20}/>} label="Support" path="/support" />
                    <NavItem icon={<ShieldCheck size={20}/>} label="Security" path="/security" />
                </nav>

                <button onClick={() => navigate('/login')} className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 hover:border-red-500/30 transition font-bold text-sm">
                    <LogOut size={20} className="text-red-400" /> Sign Out
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col overflow-hidden relative">
                <header className="bg-white p-6 shadow-sm flex justify-between items-center z-10 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{title}</h2>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="relative cursor-pointer hover:scale-110 transition"><Bell className="text-gray-400" /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div></div>
                        <p className="text-sm font-medium text-gray-500 hidden sm:block">25 Mar 2026 · 12:39</p>
                    </div>
                </header>
                
                {/* Page Content Injected Here */}
                <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};