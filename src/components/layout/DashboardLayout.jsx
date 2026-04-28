import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { secureFetch } from '../../utils/secureFetch';
import {
    Bell, CreditCard, Send, History, User,
    MessageSquare, ShieldCheck, LogOut, X, Clock, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { useInactivityLogout } from '../../hooks/useInactivityLogout';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Settings, TrendingUp, ArrowUpRight } from 'lucide-react';



const NavItem = ({ icon, label, path, count, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 p-4 rounded-2xl transition cursor-pointer font-medium ${
                active
                    ? 'bg-white text-[#1C4382] shadow-lg'
                    : 'hover:bg-white/5 text-blue-100/70 hover:text-white'
            }`}
        >
            {icon}
            <span>{label}</span>
            {count > 0 && (
                <span className="ml-auto bg-[#4A80D4] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {count}
                </span>
            )}
        </div>
    );
};

// New Currency Widget Component
const CurrencyWidget = () => {
    const [base, setBase] = useState('ZAR');
    const [target, setTarget] = useState('USD');
    const [rate, setRate] = useState(null);
    const [history, setHistory] = useState([]);
    const [isConfiguring, setIsConfiguring] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
                const data = await res.json();
                setRate(data.rates[target]);

                const end = new Date().toISOString().split('T')[0];
                const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const histRes = await fetch(`https://api.frankfurter.app/${start}..${end}?from=${base}&to=${target}`);
                const histData = await histRes.json();
                
                setHistory(Object.keys(histData.rates).map(date => ({
                    date,
                    value: histData.rates[date][target]
                })));
            } catch (err) { console.error(err); }
        };
        fetchData();
        const interval = setInterval(fetchData, 600000); // 10 mins
        return () => clearInterval(interval);
    }, [base, target]);

    return (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-bold text-blue-300/50 flex items-center gap-1">
                   <TrendingUp size={12}/> Market Insights
                </span>
                <button onClick={() => setIsConfiguring(!isConfiguring)} className="text-blue-300/50 hover:text-white">
                    <Settings size={14} />
                </button>
            </div>

            {isConfiguring ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                    <select value={base} onChange={(e) => setBase(e.target.value)} className="w-full bg-[#1C4382] border border-white/10 rounded-lg p-2 text-[10px] text-white">
                        <option value="ZAR">ZAR (Rand)</option>
                        <option value="USD">USD (Dollar)</option>
                    </select>
                    <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-[#1C4382] border border-white/10 rounded-lg p-2 text-[10px] text-white">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
            ) : (
                <>
                    <div className="flex items-baseline gap-2 mb-2">
                        <h4 className="text-xl font-mono font-bold text-white">{rate ? rate.toFixed(4) : '---'}</h4>
                        <span className="text-[9px] text-blue-200">{target}/{base}</span>
                    </div>
                    <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <Line type="monotone" dataKey="value" stroke="#4A80D4" strokeWidth={2} dot={false} />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{display: 'none'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export const DashboardLayout = ({ children, title = 'Dashboard Overview' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Currency State ───
    const [rates, setRates] = useState({ USD: 0, EUR: 0 });

    // ─── Notifications State ───
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const unreadCount = notifications.filter((n) => !n.read).length;

    // ─── Live Clock ───
    const [currentTime, setCurrentTime] = useState(new Date());

    // ─── API: Fetch Currency Rates ───
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/ZAR');
                const data = await res.json();
                setRates({
                    USD: data.rates.USD,
                    EUR: data.rates.EUR
                });
            } catch (err) {
                console.error("Currency fetch failed", err);
            }
        };
        fetchRates();
        const rateInterval = setInterval(fetchRates, 3600000); // Update every hour
        return () => clearInterval(rateInterval);
    }, []);

    // ─── Clock Interval ───
    useEffect(() => {
        const tick = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    // ─── Click Outside Notifications ───
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ─── Auth Guard ───
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!savedUser || !token) {
            navigate('/login');
        } else {
            setUser(savedUser);
        }
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const { showWarning, secondsLeft, stayLoggedIn, logout } = useInactivityLogout();

    // Prevent "Blank Screen" by showing a loader while checking auth
    if (loading) return <div className="h-screen w-full bg-[#1C4382] flex items-center justify-center text-white">Loading...</div>;
    if (!user) return null;

    const formattedDate = currentTime.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
                        <p className="text-4xl font-bold text-[#4A80D4] mb-6 tabular-nums">
                            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={logout} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition text-sm">Sign Out</button>
                            <button onClick={stayLoggedIn} className="flex-1 py-3 rounded-xl bg-[#4A80D4] text-white font-bold hover:bg-[#3A68B0] transition text-sm">Stay Logged In</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SIDEBAR ── */}
            <div className="w-64 lg:w-72 bg-[#1C4382] text-white flex flex-col p-4 lg:p-6 shadow-xl z-20 hidden md:flex shrink-0">
                <h1 className="text-2xl font-bold mb-8 tracking-tighter">GLOBALPAY</h1>

                {/* Profile Chip */}
                <div className="flex items-center gap-4 mb-8 bg-white/10 p-3 rounded-2xl">
                    <div className="w-10 h-10 bg-white text-[#1C4382] rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-none mb-1">{user.fullName}</p>
                        <p className="text-[10px] text-blue-200 opacity-70 uppercase tracking-wider">
                            Acc: ···· {user.accountNumber?.slice(-4) || '????'}
                        </p>
                    </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Main</div>
                <nav className="space-y-1 mb-6">
                    <NavItem icon={<CreditCard size={20} />} label="Overview" path="/dashboard" active={location.pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
                    <NavItem icon={<Send size={20} />} label="Make Payment" path="/payment" active={location.pathname === '/payment'} onClick={() => navigate('/payment')} />
                    <NavItem icon={<History size={20} />} label="Transactions" path="/transactions" active={location.pathname === '/transactions'} count={unreadCount} onClick={() => navigate('/transactions')} />
                </nav>

                {/* ── CURRENCY WIDGET ── */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-blue-300/50">Market Rates</span>
                        <RefreshCcw size={12} className="text-blue-300/50 animate-spin-slow" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-100">ZAR / USD</span>
                            <span className="text-xs font-mono font-bold">${rates.USD.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-100">ZAR / EUR</span>
                            <span className="text-xs font-mono font-bold">€{rates.EUR.toFixed(4)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300/50 mb-2 ml-2">Account</div>
                <nav className="space-y-1 flex-grow">
                    <NavItem icon={<User size={20} />} label="My Profile" path="/profile" active={location.pathname === '/profile'} onClick={() => navigate('/profile')} />
                    <NavItem icon={<ShieldCheck size={20} />} label="Security" path="/security" active={location.pathname === '/security'} onClick={() => navigate('/security')} />
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/20 hover:border-red-500/30 transition font-bold text-sm">
                    <LogOut size={20} className="text-red-400" /> Sign Out
                </button>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-grow flex flex-col overflow-hidden relative">
                <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center z-10 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{title}</h2>

                    <div className="flex items-center gap-5">
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-700 leading-none">{formattedDate}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                                <Clock size={10} /> {formattedTime}
                            </p>
                        </div>

                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen((o) => !o)} className="relative p-2 rounded-full hover:bg-gray-100 transition">
                                <Bell size={20} className="text-gray-500" />
                                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        <p className="text-center text-gray-400 text-xs py-8">No new notifications</p>
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