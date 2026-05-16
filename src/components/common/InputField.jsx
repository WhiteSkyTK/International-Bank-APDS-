// src/components/common/InputField.jsx
import React from 'react';
import PropTypes from 'prop-types';

export const InputField = ({ label, name, type, value, onChange, placeholder }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-[13px] font-bold text-gray-700 ml-1">
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A80D4] focus:ring-2 focus:ring-[#4A80D4]/20 outline-none transition-all text-sm bg-gray-50/50"
        />
    </div>
);

// FIX: PropTypes validation
InputField.propTypes = {
    label:       PropTypes.string.isRequired,
    name:        PropTypes.string.isRequired,
    type:        PropTypes.string,
    value:       PropTypes.string.isRequired,
    onChange:    PropTypes.func.isRequired,
    placeholder: PropTypes.string
};

InputField.defaultProps = {
    type:        'text',
    placeholder: ''
};