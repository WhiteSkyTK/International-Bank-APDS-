import React from 'react';

export const InputField = ({ label, type = "text", defaultValue }) => (
    <div className="flex flex-col mb-5">
        <label className="text-[13px] font-medium text-gray-600 mb-1">{label}</label>
        <input 
            type={type} 
            defaultValue={defaultValue}
            className="w-full border-b border-gray-400 bg-transparent py-2 text-gray-900 font-semibold outline-none focus:border-[#4A80D4] focus:border-b-2 transition" 
            required 
        />
    </div>
);