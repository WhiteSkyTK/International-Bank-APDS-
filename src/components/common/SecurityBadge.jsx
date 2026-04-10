import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SecurityBadge = () => (
    <div className="mt-8 mb-8 bg-[#EAEFEF] p-4 rounded-xl flex items-center gap-4 text-[#607D75] text-xs font-semibold self-center w-full shadow-sm z-20">
        <ShieldCheck size={20} className="text-[#C68A55] flex-shrink-0" />
        <span className="leading-tight">Protected by 256-bit SSL encryption.<br/>Your data is always secure.</span>
    </div>
);