// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes total
const WARNING_BEFORE_MS   =  2 * 60 * 1000; // warn at 13 min (2 min before logout)

export const useInactivityLogout = () => {
    const navigate     = useNavigate();
    const timerRef     = useRef(null);
    const warnRef      = useRef(null);
    const countdownRef = useRef(null);
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(120);

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

        // Show warning banner 2 min before logout
        warnRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsLeft(120);
            countdownRef.current = setInterval(() => {
                setSecondsLeft((s) => (s <= 1 ? (clearInterval(countdownRef.current), 0) : s - 1));
            }, 1000);
        }, INACTIVE_TIMEOUT_MS - WARNING_BEFORE_MS);

        // Hard logout after full timeout
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