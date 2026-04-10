import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { WaveBackground } from '../graphics/WaveBackground';

export const AuthLayout = ({ children, type }) => {
    const navigate = useNavigate();
    const isLogin = type === 'login';

    return (
        <div className="flex h-screen w-full font-sans relative overflow-hidden bg-[#87A8CA]">
            
            {/* 1. BACKGROUND IMAGE */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url('/wallet-bg.png')` }} 
            ></div>

            {/* GLOBALPAY LOGO */}
            <div className="absolute top-8 left-12 z-10 text-white font-bold text-2xl tracking-widest hidden md:block">
                GLOBALPAY
            </div>

            {/* 2. THE RIGHT PANEL (White Background) */}
            <div className="absolute right-0 top-0 h-full w-full md:w-[42%] max-w-[550px] bg-white z-20 flex flex-col shadow-2xl">
                
                {/* Attaches the double wiggle to the left edge */}
                <WaveBackground />

                <div className="h-full flex flex-col p-10 md:p-14 overflow-y-auto">
                    {/* Top Navigation Toggle */}
                    <div className="flex justify-end gap-8 mb-10 text-lg z-20">
                        <button 
                            onClick={() => navigate('/login')} 
                            className={`font-semibold pb-1 ${isLogin ? "text-[#4A80D4] border-b-2 border-[#4A80D4]" : "text-[#7B96B5] hover:text-[#4A80D4] transition"}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate('/register')} 
                            className={`font-semibold pb-1 ${!isLogin ? "text-[#4A80D4] border-b-2 border-[#4A80D4]" : "text-[#7B96B5] hover:text-[#4A80D4] transition"}`}
                        >
                            Sign up
                        </button>
                    </div>

                    {/* Injected Form Content */}
                    <div className="flex-grow flex flex-col z-20">
                        {children}
                    </div>

                    {/* Security Footer Badge (Matches Figma with Red Shield) */}
                    <div className="mt-8 bg-[#EAEFEF] p-4 rounded-xl flex items-center gap-4 text-[#607D75] text-xs font-semibold self-center w-full shadow-sm z-20">
                        <ShieldCheck size={24} className="text-[#D66868] flex-shrink-0" />
                        <span className="leading-tight">Protected by 256-bit SSL encryption.<br/>Your data is always secure.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};