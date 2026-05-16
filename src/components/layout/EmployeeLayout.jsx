// src/components/layout/EmployeeLayout.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, LogOut, Bell, Clock, AlertTriangle, X, ShieldCheck } from 'lucide-react';

// ── Move constants outside the hook ──────────────────────────────────────────
const TIMEOUT = 8 * 60 * 60 * 1000;  // 8 hours
const WARN    = 2 * 60 * 1000;        // warn 2 min before

// ── Inactivity hook ────────────────────────────────────────────────────────
const useEmployeeInactivity = (onLogout) => {
    const timerRef = useRef(null);
    const warnRef  = useRef(null);
    const countRef = useRef(null);
    const [showWarn, setShowWarn] = useState(false);
    const [secs, setSecs]         = useState(120);

    const reset = useCallback((isInitial = false) => {
        if (isInitial !== true) setShowWarn(false);
        clearTimeout(timerRef.current);
        clearTimeout(warnRef.current);
        clearInterval(countRef.current);

        warnRef.current = setTimeout(() => {
            setShowWarn(true);
            setSecs(120);
            countRef.current = setInterval(() =>
                setSecs((s) => s <= 1 ? (clearInterval(countRef.current), 0) : s - 1), 1000);
        }, TIMEOUT - WARN);

        timerRef.current = setTimeout(onLogout, TIMEOUT);
    }, [onLogout]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
        const handleEvent = () => reset(false);
        
        events.forEach((e) => window.addEventListener(e, handleEvent, { passive: true }));
        reset(true); // Pass true to avoid setting state synchronously during mount
        
        // Safely capture refs for the cleanup phase
        const currentTimer = timerRef.current;
        const currentWarn = warnRef.current;
        const currentCount = countRef.current;
        
        return () => {
            events.forEach((e) => window.removeEventListener(e, handleEvent));
            clearTimeout(currentTimer);
            clearTimeout(currentWarn);
            clearInterval(currentCount);
        };
    }, [reset]);

    return { showWarn, secs, reset: () => reset(false) };
};

// ── Move NavItem outside to prevent re-renders ─────────────────────────────
const NavItem = ({ icon, label, path }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const active = location.pathname === path;
    return (
        <div onClick={() => navigate(path)}
            className={`flex items-center gap-4 p-4 rounded-2xl transition cursor-pointer font-medium ${
                active ? 'bg-white text-red-700 shadow-lg' : 'hover:bg-white/10 text-red-100/70 hover:text-white'
            }`}>
            {icon} <span>{label}</span>
        </div>
    );
};

export const EmployeeLayout = ({ children, title = 'Employee Dashboard' }) => {
    const navigate  = useNavigate();
    const [now, setNow] = useState(new Date());

    // ── Lazy State Initialization ──────────────────────────────────────────
    const [employee, setEmployee] = useState(() => {
        return JSON.parse(localStorage.getItem('employee')) || null;
    });

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('empToken');
        localStorage.removeItem('employee');
        navigate('/employee/login');
    }, [navigate]);

    const { showWarn, secs, reset: stayIn } = useEmployeeInactivity(handleLogout);

    // ── Redirect handling simplified ───────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('empToken');
        if (!employee || !token) { 
            navigate('/employee/login'); 
        }
    }, [employee, navigate]);

    if (!employee) return null;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">

            {/* Inactivity Warning */}
            {showWarn && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Session Expiring</h2>
                        <p className="text-gray-500 text-sm mb-2">You'll be signed out in:</p>
                        <p className="text-5xl font-bold text-red-600 mb-6 tabular-nums">
                            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={handleLogout}
                                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 text-sm hover:bg-gray-50 transition">
                                Sign Out
                            </button>
                            <button onClick={stayIn}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">
                                Stay Logged In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 lg:w-72 bg-[#7B1A1A] text-white flex flex-col p-4 lg:p-6 shadow-xl hidden md:flex shrink-0">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tighter">GLOBALPAY</h1>
                    <p className="text-red-300 text-xs tracking-[0.25em] uppercase mt-0.5">Staff Portal</p>
                </div>

                {/* Employee chip */}
                <div className="flex items-center gap-3 mb-8 bg-white/10 p-3 rounded-2xl">
                    <div className="w-10 h-10 bg-red-200 text-red-800 rounded-full flex items-center justify-center font-bold text-lg shadow">
                        {employee.fullName?.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{employee.fullName}</p>
                        <p className="text-[10px] text-red-300 uppercase tracking-wider">{employee.employeeId}</p>
                    </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-widest text-red-400/60 mb-2 ml-2">Navigation</div>
                <nav className="space-y-1 flex-grow">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard"    path="/employee/dashboard" />
                    <NavItem icon={<ClipboardCheck size={20} />}  label="Verify Payments" path="/employee/payments" />
                </nav>

                {/* Live clock */}
                <div className="mb-4 bg-white/5 rounded-2xl p-3">
                    <div className="flex items-center gap-2 text-red-200 text-[11px] mb-1">
                        <Clock size={12} /> Session Active
                    </div>
                    <p className="text-white font-mono text-sm font-bold">
                        {now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-red-300 text-[10px] mt-0.5">
                        {now.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>

                <button onClick={handleLogout}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-white/20 hover:bg-red-500/30 transition font-bold text-sm">
                    <LogOut size={20} className="text-red-300" /> Sign Out
                </button>
            </div>

            {/* Main */}
            <div className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{title}</h2>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-xs font-bold text-gray-600">
                                {now.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                                {now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                        </div>
                        <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                            <ShieldCheck size={12} /> {employee.employeeId}
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