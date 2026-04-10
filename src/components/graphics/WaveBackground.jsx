import React from 'react';

export const WaveBackground = () => (
    <svg 
        viewBox="0 0 100 1000" 
        preserveAspectRatio="none" 
        className="hidden md:block absolute top-0 right-full h-full w-[120px] lg:w-[180px] pointer-events-none"
    >
        {/* Light Blue Shadow Wave (Single perfectly smooth curve) */}
        <path 
            d="M100,0 C-60,350 120,650 -10,1000 L100,1000 Z" 
            fill="#CFE1F0" 
        />
        {/* Crisp White Foreground Wave (Single perfectly smooth curve) */}
        <path 
            d="M100,0 C-10,350 170,650 40,1000 L100,1000 Z" 
            fill="#FFFFFF" 
        />
    </svg>
);