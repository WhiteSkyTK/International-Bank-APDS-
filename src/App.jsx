// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ShieldCheck, Bell, CreditCard, Send, History, User, Settings, LogOut, Phone, MessageSquare, Mail } from 'lucide-react';

// --- AUTHENTICATION COMPONENTS (Login/Register/Forgot) ---
const AuthLayout = ({ children, type }) => {
    const navigate = useNavigate();
    return (
        <div className="flex h-screen w-full bg-[#93B4D9] font-sans overflow-hidden">
            {/* Left Side: 3D Art Simulation (Matches Screenshot) */}
            <div className="w-1/2 hidden md:flex flex-col justify-center items-center relative text-white">
                <h1 className="absolute top-10 left-12 text-3xl font-bold tracking-tighter">GLOBALPAY</h1>
                
                {/* 3D Wallet Representation */}
                <div className="relative w-80 h-64 bg-[#4A80D4] rounded-[2rem] shadow-2xl border-2 border-white/20 transform -rotate-3 flex items-center justify-center">
                    <div className="w-16 h-20 bg-[#C68A55] rounded-lg absolute right-0 shadow-inner"></div>
                    {/* Floating Coins */}
                    <div className="absolute -top-10 -right-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-100">
                        <span className="text-[#C68A55] font-bold text-2xl">₿</span>
                    </div>
                    <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-100">
                        <span className="text-[#C68A55] font-bold text-2xl">$</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Wave Form Container */}
            <div className="w-full md:w-1/2 bg-white h-full md:rounded-l-[5rem] shadow-2xl flex flex-col p-16 relative overflow-y-auto">
                <div className="flex justify-end gap-8 mb-12 text-lg font-semibold">
                    <button onClick={() => navigate('/login')} className={type === 'login' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-400"}>Login</button>
                    <button onClick={() => navigate('/register')} className={type === 'register' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-400"}>Sign up</button>
                </div>
                {children}
                
                {/* Security Footer Badge (Matches Screenshot) */}
                <div className="mt-auto bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 text-[#4A80D4] text-xs font-medium self-center w-full max-w-sm">
                    <ShieldCheck size={20} />
                    <span>Protected by 256-bit SSL encryption. Your data is always secure.</span>
                </div>
            </div>
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const handleReg = (e) => { e.preventDefault(); alert("Securely Registered over HTTPS!"); navigate('/login'); };
    return (
        <AuthLayout type="register">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome 👋</h2>
            <p className="text-gray-400 mb-10">Please register to create your account</p>
            <form onSubmit={handleReg} className="space-y-6 max-w-md">
                {["Full Name", "ID Number", "Account Number", "Password"].map((label) => (
                    <div key={label}>
                        <label className="text-sm font-medium text-gray-500">{label}</label>
                        <input type={label === "Password" ? "password" : "text"} className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-400 transition" required />
                    </div>
                ))}
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 transition transform hover:scale-[1.02]">Register</button>
            </form>
        </AuthLayout>
    );
};

const Login = () => {
    const navigate = useNavigate();
    const handleLogin = (e) => { e.preventDefault(); navigate('/dashboard'); };
    return (
        <AuthLayout type="login">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back 👋</h2>
            <p className="text-gray-400 mb-10">Please login to your account</p>
            <form onSubmit={handleLogin} className="space-y-8 max-w-md">
                <div>
                    <label className="text-sm font-medium text-gray-500">User Name</label>
                    <input type="text" className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-400 transition" defaultValue="Jsmith" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500">Account Number</label>
                    <input type="text" className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-400 transition" defaultValue="10296818" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500">Password</label>
                    <input type="password" className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-400 transition" defaultValue="********" />
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-blue-400 font-medium">
                    <a href="#" className="hover:underline">Forgot User Name?</a>
                    <a href="#" className="hover:underline">Forgot Password?</a>
                    <a href="#" className="hover:underline">Forgot Account Number?</a>
                </div>
                <button type="submit" className="w-full bg-[#4A80D4] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg transition transform hover:scale-[1.02]">Login</button>
            </form>
        </AuthLayout>
    );
};

// --- DASHBOARD COMPONENT (Matches Figma Overview) ---
const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="flex h-screen bg-[#E5E7EB] font-sans">
            {/* Sidebar (Matches Blue Sidebar in Screenshot) */}
            <div className="w-72 bg-[#1C4382] text-white flex flex-col p-6 shadow-xl">
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
                    <div className="pt-8 opacity-40 text-[10px] uppercase font-bold tracking-widest mb-4">Account</div>
                    <NavItem icon={<User size={20}/>} label="My Profile" />
                    <NavItem icon={<MessageSquare size={20}/>} label="Support" />
                    <NavItem icon={<ShieldCheck size={20}/>} label="Security" />
                </nav>

                <button onClick={() => navigate('/login')} className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 transition font-bold">
                    <LogOut size={20} /> Sign Out
                </button>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative"><Bell className="text-gray-400" /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div></div>
                        <p className="text-sm font-medium text-gray-500">25 Mar 2026 · 12:39</p>
                    </div>
                </header>

                <main className="p-10 overflow-y-auto space-y-8">
                    {/* Balance Card (Matches Figma) */}
                    <div className="bg-gradient-to-br from-[#1C4382] to-[#4A80D4] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-white/5 rounded-full"></div>
                        <p className="text-blue-100 text-lg mb-2">Available Balance</p>
                        <h3 className="text-6xl font-bold mb-8 tracking-tight">R 84,250.00</h3>
                        <div className="flex gap-16 text-blue-100">
                            <div><p className="text-xs opacity-70 mb-1">Account Number</p><p className="font-bold tracking-widest">**** **** 8818</p></div>
                            <div><p className="text-xs opacity-70 mb-1">Account Type</p><p className="font-bold">Cheque Account</p></div>
                            <div><p className="text-xs opacity-70 mb-1">Branch Code</p><p className="font-bold">250655</p></div>
                        </div>
                        <div className="absolute right-10 bottom-10 flex gap-4">
                            <button className="bg-white text-[#1C4382] px-6 py-3 rounded-2xl font-bold shadow-lg">+ Make Payment</button>
                            <button className="bg-white/20 border border-white/30 px-6 py-3 rounded-2xl font-bold backdrop-blur-sm">Download Statement</button>
                        </div>
                    </div>

                    {/* Stats Grid (Matches Figma Bottom Row) */}
                    <div className="grid grid-cols-4 gap-6">
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

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}