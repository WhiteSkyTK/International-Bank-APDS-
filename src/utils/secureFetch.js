// src/utils/secureFetch.js
/**
 * A thin wrapper around fetch that:
 * 1. Automatically attaches the JWT Authorization header
 * 2. Redirects to /login if the server returns 401 or 403 (expired / invalid token)
 */
export const secureFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    // Auto-logout on auth failure
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?reason=session_expired';
        return null;
    }

    return response;
};