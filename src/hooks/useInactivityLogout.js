// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVE_TIMEOUT_MS = 90 * 1000; // 90 seconds total
const WARNING_BEFORE_MS   = 30 * 1000; // warn at 60s (30s before logout)

export const useInactivityLogout = () => {
    const navigate     = useNavigate();
    const timerRef     = useRef(null);
    const warnRef      = useRef(null);
    const countdownRef = useRef(null);
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);

    const logout = useCallback(() => {
        clearTimeout(timerRef.current);
        clearTimeout(warnRef.current);
        clearInterval(countdownRef.current);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login?reason=inactivity');
    }, [navigate]);

    const resetTimer = useCallback(() => {
        setShowWarning(false);
        clearTimeout(timerRef.current);
        clearTimeout(warnRef.current);
        clearInterval(countdownRef.current);

        // Show warning 30s before logout
        warnRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsLeft(30);
            countdownRef.current = setInterval(() => {
                setSecondsLeft((s) => {
                    if (s <= 1) { clearInterval(countdownRef.current); return 0; }
                    return s - 1;
                });
            }, 1000);
        }, INACTIVE_TIMEOUT_MS - WARNING_BEFORE_MS);

        timerRef.current = setTimeout(logout, INACTIVE_TIMEOUT_MS);
    }, [logout]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
        resetTimer();
        return () => {
            events.forEach((ev) => window.removeEventListener(ev, resetTimer));
            clearTimeout(timerRef.current);
            clearTimeout(warnRef.current);
            clearInterval(countdownRef.current);
        };
    }, [resetTimer]);

    return { showWarning, secondsLeft, stayLoggedIn: resetTimer, logout };
};