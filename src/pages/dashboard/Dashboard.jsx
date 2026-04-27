import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, History, Send, LogOut } from 'lucide-react';

// ... (NavItem and StatCard components stay the same)

export const Dashboard = () => {
    const navigate = useNavigate();
    
    // Pull real data from the handshake
    const userName = localStorage.getItem('userName') || "User";
    const balance = localStorage.getItem('userBalance') || "0.00";
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleSignOut = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#E5E7EB] font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-[#1C4382] text-white flex flex-col p-6 shadow-xl z-20 hidden md:flex">
                <h1 className="text-2xl font-bold mb-10 tracking-tighter">GLOBALPAY</h1>
                <div className="flex items-center gap-4 mb-12 bg-white/10 p-3 rounded-2xl">
                    <div className="w-12 h-12 bg-white text-[#1C4382] rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                        {initials}
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-none mb-1">{userName}</p>
                        <p className="text-xs text-blue-200 opacity-70">Personal Account</p>
                    </div>
                </div>
                <nav className="flex-grow space-y-2">
                    <NavItem icon={<History size={20}/>} label="Overview" active />
                    <NavItem icon={<Send size={20}/>} label="Make Payment" onClick={() => navigate('/make-payment')} />
                    <NavItem icon={<History size={20}/>} label="Transactions" count="3" />
                </nav>
                <button onClick={handleSignOut} className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 transition font-bold">
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
            
            <div className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <div className="flex items-center gap-6">
                        <Bell className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString()}</p>
                    </div>
                </header>
                <main className="p-6 md:p-10 overflow-y-auto space-y-8">
                    <div className="bg-gradient-to-br from-[#1C4382] to-[#4A80D4] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <p className="text-blue-100 text-lg mb-2">Available Balance</p>
                        <h3 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
                            R {parseFloat(balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </h3>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/make-payment')} className="bg-white text-[#1C4382] px-6 py-3 rounded-2xl font-bold shadow-lg">+ Make Payment</button>
                        </div>
                    </div>
                    {/* ... Stats Grid remains same ... */}
                </main>
            </div>
        </div>
    );
};