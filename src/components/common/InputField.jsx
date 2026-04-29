import React from 'react';

export const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-[13px] font-bold text-gray-700 ml-1">
                {label}
            </label>
            <input
                name={name}
                type={type}
                value={value} // This links to your formData
                onChange={onChange} // This MUST be here for typing to work
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20 outline-none transition-all text-sm bg-gray-50/50"
            />
        </div>
    );
};