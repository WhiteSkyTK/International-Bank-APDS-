// src/utils/security.js
export const SecurityPatterns = {
    name:          /^[a-zA-Z\s]{2,50}$/,
    idNumber:      /^\d{13}$/,               // FIX: \d not [0-9]
    accountNumber: /^\d{8,12}$/,             // FIX: \d not [0-9]
    username:      /^\w{4,20}$/,             // FIX: \w not [a-zA-Z0-9_]
    password:      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    swiftCode:     /^[A-Z0-9]{8,11}$/,
    amount:        /^\d+(\.\d{1,2})?$/,
    employeeId:    /^EMP\d{3,6}$/
};