import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { WaveBackground } from '../graphics/WaveBackground';

/**
 * AuthLayout — Customer Portal ONLY
 * Theme: Blue (#4A80D4)
 * NOTE: Employee portal uses a separate EmployeeAuthLayout with red theme.
 */
export const AuthLayout = ({ children, type }) => {
    const navigate = useNavigate();
    const isLogin = type === 'login';

    return (
        <div className="flex h-screen w-full font-sans relative overflow-hidden bg-[#87A8CA]">

            {/* BACKGROUND IMAGE */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url('/wallet-bg.png')` }}
            />

            {/* GLOBALPAY LOGO */}
            <div className="absolute top-8 left-12 z-10 text-white font-bold text-2xl tracking-widest hidden md:block">
                GLOBALPAY
            </div>

            {/* RIGHT PANEL */}
            <div className="absolute right-0 top-0 h-full w-full md:w-[42%] max-w-[550px] bg-white z-20 flex flex-col shadow-2xl">
                <WaveBackground />

                <div className="h-full flex flex-col p-10 md:p-14 overflow-y-auto">
                    {/* Login / Sign Up Toggle */}
                    <div className="flex justify-end gap-8 mb-10 text-lg z-20">
                        <button
                            onClick={() => navigate('/login')}
                            className={`font-semibold pb-1 transition ${
                                isLogin
                                    ? 'text-[#4A80D4] border-b-2 border-[#4A80D4]'
                                    : 'text-[#7B96B5] hover:text-[#4A80D4]'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className={`font-semibold pb-1 transition ${
                                !isLogin
                                    ? 'text-[#4A80D4] border-b-2 border-[#4A80D4]'
                                    : 'text-[#7B96B5] hover:text-[#4A80D4]'
                            }`}
                        >
                            Sign up
                        </button>
                    </div>

                    {/* Page Content */}
                    <div className="flex-grow flex flex-col z-20">
                        {children}
                    </div>

                    {/* Security Badge — BLUE shield for customer portal */}
                    <div className="mt-8 bg-[#EAF2FB] p-4 rounded-xl flex items-center gap-4 text-[#4A6FA5] text-xs font-semibold self-center w-full shadow-sm z-20">
                        <ShieldCheck size={24} className="text-[#4A80D4] flex-shrink-0" />
                        <span className="leading-tight">
                            Protected by 256-bit SSL encryption.<br />
                            Your data is always secure.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};