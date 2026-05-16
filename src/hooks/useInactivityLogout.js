// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVE_TIMEOUT_MS = 90 * 1000;
const WARNING_BEFORE_MS   = 30 * 1000;

// FIX: extracted countdown tick to top level — reduces nesting depth
const startCountdown = (setter, intervalRef) => {
    setter(30);
    intervalRef.current = setInterval(() => {
        setter((s) => {
            if (s <= 1) {
                clearInterval(intervalRef.current);
                return 0;
            }
            return s - 1;
        });
    }, 1000);
};

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

    // FIX: extracted warning handler to reduce nesting
    const triggerWarning = useCallback(() => {
        setShowWarning(true);
        startCountdown(setSecondsLeft, countdownRef);
    }, []);

    const resetTimer = useCallback(() => {
        setShowWarning(false);
        clearTimeout(timerRef.current);
        clearTimeout(warnRef.current);
        clearInterval(countdownRef.current);

        warnRef.current  = setTimeout(triggerWarning, INACTIVE_TIMEOUT_MS - WARNING_BEFORE_MS);
        timerRef.current = setTimeout(logout, INACTIVE_TIMEOUT_MS);
    }, [logout, triggerWarning]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        // FIX: globalThis instead of window
        events.forEach((ev) => globalThis.addEventListener(ev, resetTimer, { passive: true }));
        resetTimer();
        return () => {
            events.forEach((ev) => globalThis.removeEventListener(ev, resetTimer));
            clearTimeout(timerRef.current);
            clearTimeout(warnRef.current);
            clearInterval(countdownRef.current);
        };
    }, [resetTimer]);

    return { showWarning, secondsLeft, stayLoggedIn: resetTimer, logout };
};