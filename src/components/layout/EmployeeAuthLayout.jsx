// src/components/layout/EmployeeAuthLayout.jsx
//
// Put New.jpg in your /public folder (same place as wallet-bg.png)
// It is referenced as url('/New.jpg') below.

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const EmployeeAuthLayout = ({ children }) => (
    <div className="flex h-screen w-full font-sans relative overflow-hidden bg-[#C0392B]">

        {/* 1. BACKGROUND IMAGE — same pattern as customer portal */}
        <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url('/new.jpg')` }}
        />

        {/* GLOBALPAY Staff logo */}
        <div className="absolute top-8 left-12 z-10 hidden md:block">
            <p className="text-white font-bold text-2xl tracking-widest drop-shadow-lg">GLOBALPAY</p>
            <p className="text-red-100 text-xs tracking-[0.3em] font-medium uppercase mt-0.5 drop-shadow">
                Staff Portal
            </p>
        </div>

        {/* 2. WHITE RIGHT PANEL — identical structure to customer AuthLayout */}
        <div className="absolute right-0 top-0 h-full w-full md:w-[42%] max-w-[550px] bg-white z-20 flex flex-col shadow-2xl">

            {/* Red wave edge — mirrors the customer blue wave */}
            <svg
                viewBox="0 0 100 1000"
                preserveAspectRatio="none"
                className="hidden md:block absolute top-0 right-full h-full w-[120px] lg:w-[180px] pointer-events-none"
            >
                <path d="M100,0 C-60,350 120,650 -10,1000 L100,1000 Z" fill="#fca5a5" />
                <path d="M100,0 C-10,350 170,650 40,1000 L100,1000 Z" fill="#FFFFFF" />
            </svg>

            <div className="h-full flex flex-col p-10 md:p-14 overflow-y-auto">

                {/* Staff-only badge — replaces the Login/Sign Up toggle */}
                <div className="flex justify-end mb-10 z-20">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Authorised Staff Only
                    </span>
                </div>

                {/* Page content injected here */}
                <div className="flex-grow flex flex-col z-20">
                    {children}
                </div>

                {/* Security badge — red version of the customer blue badge */}
                <div className="mt-8 bg-red-50 p-4 rounded-xl flex items-center gap-4 text-red-700 text-xs font-semibold w-full shadow-sm z-20">
                    <ShieldCheck size={24} className="text-red-500 flex-shrink-0" />
                    <span className="leading-tight">
                        Staff portal protected by 256-bit SSL encryption.<br />
                        All sessions are monitored and audited.
                    </span>
                </div>
            </div>
        </div>
    </div>
);