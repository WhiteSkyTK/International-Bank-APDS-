// Strict Whitelisting RegEx Patterns to prevent SQLi and XSS
// src/utils/security.js
export const SecurityPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    idNumber: /^[0-9]{13}$/,
    accountNumber: /^[0-9]{8,12}$/,
    username: /^[a-zA-Z0-9_]{4,20}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    swiftCode: /^[A-Z0-9]{8,11}$/,
    amount: /^\d+(\.\d{1,2})?$/
};

export const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};