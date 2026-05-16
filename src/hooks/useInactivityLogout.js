// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVE_TIMEOUT_MS = 90 * 1000;
const WARNING_BEFORE_MS   = 30 * 1000;

// Extracted countdown tick to top level — reduces nesting depth
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

    const triggerWarning = useCallback(() => {
        setShowWarning(true);
        startCountdown(setSecondsLeft, countdownRef);
    }, []);

    // Accepts isInitial flag to prevent synchronous state updates during mount
    const resetTimer = useCallback((isInitial = false) => {
        if (isInitial !== true) {
            setShowWarning(false);
        }
        clearTimeout(timerRef.current);
        clearTimeout(warnRef.current);
        clearInterval(countdownRef.current);

        warnRef.current  = setTimeout(triggerWarning, INACTIVE_TIMEOUT_MS - WARNING_BEFORE_MS);
        timerRef.current = setTimeout(logout, INACTIVE_TIMEOUT_MS);
    }, [logout, triggerWarning]);

    useEffect(() => {
        // Capture ref configurations to avoid mutation changes during unmount
        const currentTimer = timerRef.current;
        const currentWarn = warnRef.current;
        const currentCountdown = countdownRef.current;
        
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        
        const handleEvent = () => resetTimer(false);
        events.forEach((ev) => globalThis.addEventListener(ev, handleEvent, { passive: true }));
        
        resetTimer(true); // Pass true to skip state update on initial mount

        return () => {
            events.forEach((ev) => globalThis.removeEventListener(ev, handleEvent));
            clearTimeout(currentTimer);
            clearTimeout(currentWarn);
            clearInterval(currentCountdown);
        };
    }, [resetTimer]);

    // Wrap stayLoggedIn so event objects from button clicks aren't passed as 'isInitial'
    const stayLoggedIn = useCallback(() => {
        resetTimer(false);
    }, [resetTimer]);

    return { showWarning, secondsLeft, stayLoggedIn, logout };
};