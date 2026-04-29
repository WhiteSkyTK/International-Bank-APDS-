import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Bell, CreditCard, Send, History, User,
    MessageSquare, ShieldCheck, LogOut,
    X, Clock, AlertTriangle
} from 'lucide-react';
import { useInactivityLogout } from '../../hooks/useInactivityLogout';
import { secureFetch } from '../../utils/secureFetch';

export const DashboardLayout = ({ children, title = 'Dashboard Overview' }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [user, setUser] = useState(null);

    // ── Live clock ───────────────────────────────────────────────────────────
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    // ── Notifications ────────────────────────────────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen]         = useState(false);
    const notifRef                          = useRef(null);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = async (uid) => {
        try {
            const res = await secureFetch(`https://localhost:5000/api/notifications/${uid}`);
            if (res && res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch { /* silent — notifications are non-critical */ }
    };

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = async () => {
        const uid = JSON.parse(localStorage.getItem('user'))?.id;
        if (!uid) return;
        try {
            await secureFetch(`https://localhost:5000/api/notifications/${uid}/read-all`, { method: 'PATCH' });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const dismissNotif = async (id) => {
        try {
            await secureFetch(`https://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch { /* silent */ }
    };

    // ── Inactivity auto-logout ───────────────────────────────────────────────
    const { showWarning, secondsLeft, stayLoggedIn, logout } = useInactivityLogout();

    // ── Auth guard ───────────────────────────────────────────────────────────
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token     = localStorage.getItem('token');
        if (!savedUser || !token) {
            navigate('/login');
        } else {
            setUser(savedUser);
            fetchNotifications(savedUser.id);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const NavItem = ({ icon, label, path }) => {
        const active = location.pathname === path;
        return (
            <div
                onClick={() => navigate(path)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition cursor-pointer font-medium ${
                    active
                        ? 'bg-white text-[#1C4382] shadow-lg'
                        : 'hover:bg-white/5 text-blue-100/70 hover:text-white'
                }`}
            >
                {icon}
                <span>{label}</span>
            </div>
        );
    };

    if (!user) return null;

    const formattedDate = now.toLocaleDateString('en-ZA', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-ZA', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return (
        <div className="flex h-screen bg-[#E5E7EB] font-sans">

            {/* ── INACTIVITY WARNING MODAL ── */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Still there?</h2>
                        <p className="text-gray-500 text-sm mb-2">
                            You'll be signed out due to inactivity in:
                        </p>
                        <p className="text-5xl font-bold text-[#4A80D4] mb-6 tabular-nums">
                            {String(secondsLeft).padStart(2, '0')}s
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={logout}
                                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition text-sm"
                            >
                                Sign Out
                            </button>
                            <button
                                onClick={stayLoggedIn}
                                className="flex-1 py-3 rounded-xl bg-[#4A80D4] text-white font-bold hover:bg-[#3A68B0] transition text-sm"
                            >
                                Stay Logged In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SIDEBAR ── */}
            <div className="w-64 lg:w-72 bg-[#1C4382] text-white flex flex-col p-4 lg:p-6 shadow-xl z-20 hidden md:flex shrink-0">
                <h1 className="text-2xl font-bold mb-8 tracking-tighter">GLOBALPAY</h1>

                {/* Profile chip */}
                <div className="flex items-center gap-3 mb-8 bg-white/10 p-3 rounded-2xl">
                    <div className="w-10 h-10 bg-white text-[#1C4382] rounded-full flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                        {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm leading-none mb-1 truncate">{user.fullName}</p>
                        <p className="text-[10px] text-blue-200 opacity-70 uppercase tracking-wider">
                            ···· {user.accountNumber?.slice(-4) || '????'}
                        </p>
                    </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Main</div>
                <nav className="space-y-1 mb-6">
                    <NavItem icon={<CreditCard size={20} />} label="Overview"     path="/dashboard" />
                    <NavItem icon={<Send size={20} />}       label="Make Payment" path="/payment" />
                    {/* No badge count here — shown in dashboard overview instead */}
                    <NavItem icon={<History size={20} />}    label="Transactions" path="/transactions" />
                </nav>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Account</div>
                <nav className="space-y-1 flex-grow">
                    <NavItem icon={<User size={20} />}          label="My Profile" path="/profile" />
                    <NavItem icon={<MessageSquare size={20} />} label="Support"    path="/support" />
                    <NavItem icon={<ShieldCheck size={20} />}   label="Security"   path="/security" />
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 hover:border-red-500/30 transition font-bold text-sm"
                >
                    <LogOut size={20} className="text-red-400" /> Sign Out
                </button>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-grow flex flex-col overflow-hidden">

                {/* Header */}
                <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center z-10 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{title}</h2>

                    <div className="flex items-center gap-5">
                        {/* Live date + time */}
                        <div className="hidden sm:flex flex-col items-end leading-none">
                            <p className="text-xs font-semibold text-gray-600">{formattedDate}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                                <Clock size={10} /> {formattedTime}
                            </p>
                        </div>

                        {/* Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen((o) => !o)}
                                className="relative p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <Bell size={20} className="text-gray-500" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-sm">
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-[11px] text-[#4A80D4] font-semibold hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-gray-400 text-xs py-8">All caught up 🎉</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    className={`flex items-start gap-3 px-5 py-4 ${!n.read ? 'bg-blue-50/50' : 'bg-white'}`}
                                                >
                                                    <span className="text-xl mt-0.5 shrink-0">{n.icon || '🔔'}</span>
                                                    <div className="flex-grow min-w-0">
                                                        <p className={`text-xs font-bold ${!n.read ? 'text-[#1C4382]' : 'text-gray-800'}`}>
                                                            {n.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {new Date(n.createdAt).toLocaleString('en-ZA', {
                                                                day: 'numeric', month: 'short',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => dismissNotif(n._id)}
                                                        className="text-gray-300 hover:text-gray-500 transition shrink-0 mt-0.5"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};