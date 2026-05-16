// src/utils/secureFetch.js
// FIX: validate URL before use (SonarQube: tainted URL path)
const ALLOWED_BASE = 'https://localhost:5000';

const isSafeUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.origin === ALLOWED_BASE;
    } catch {
        return false;
    }
};

export const secureFetch = async (url, options = {}) => {
    // FIX: validate URL is from our trusted origin only
    if (!isSafeUrl(url)) {
        throw new Error('Blocked: URL is not from a trusted origin.');
    }

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
        // FIX: removed useless empty object spread ...(options.headers || {})
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // FIX: globalThis instead of window
        globalThis.location.href = '/login?reason=session_expired';
        return null;
    }

    return response;
};