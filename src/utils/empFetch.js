// src/utils/empFetch.js
// Single source of truth for authenticated employee API calls.
// Also applies the same URL safety check as secureFetch (jssecurity:S8476).
const ALLOWED_ORIGIN = 'https://localhost:5000';

const parseSafeUrl = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.origin !== ALLOWED_ORIGIN) return null;
        if (!/^[a-zA-Z0-9/_-]+$/.test(parsed.pathname)) return null;
        return parsed;
    } catch {
        return null;
    }
};

export const empFetch = async (url, options = {}) => {
    const parsedUrl = parseSafeUrl(url);
    if (!parsedUrl) {
        throw new Error('Blocked: URL failed safe-origin/path validation.');
    }

    const token = localStorage.getItem('empToken');
    const { headers: extraHeaders, ...restOptions } = options;

    const res = await fetch(parsedUrl.href, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
            ...extraHeaders,
        },
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('empToken');
        localStorage.removeItem('employee');
        globalThis.location.href = '/employee/login?reason=session_expired';
        return null;
    }
    return res;
};