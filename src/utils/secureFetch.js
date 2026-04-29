// src/utils/secureFetch.js
/**
 * Wraps native fetch with:
 * 1. Automatic JWT Authorization header
 * 2. Auto-logout + redirect on 401 / 403 (expired / invalid token)
 */
export const secureFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?reason=session_expired';
        return null;
    }

    return response;
};