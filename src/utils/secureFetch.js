// src/utils/secureFetch.js
const ALLOWED_ORIGIN = 'https://localhost:5000';

// Validates origin AND that the path contains only safe characters,
// preventing tainted localStorage data (e.g. user.id) from being used
// as a path-injection vector. MongoDB IDs (24 hex chars) pass fine.
const isSafeUrl = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.origin !== ALLOWED_ORIGIN) return false;
        // Allow only alphanumeric, hyphens, underscores, forward slashes
        return /^[a-zA-Z0-9/_-]+$/.test(parsed.pathname);
    } catch {
        return false;
    }
};

export const secureFetch = async (url, options = {}) => {
    if (!isSafeUrl(url)) {
        throw new Error('Blocked: URL failed safe-origin/path validation.');
    }

    const token = localStorage.getItem('token');
    const { headers: extraHeaders, ...restOptions } = options;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...extraHeaders,
        },
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        globalThis.location.href = '/login?reason=session_expired';
        return null;
    }

    return response;
};