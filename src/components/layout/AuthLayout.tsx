import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center p-4 selection:bg-brand-pink/20 selection:text-brand-pink">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-black text-white text-xl font-black shadow-md mb-2">
            I
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Influverse HQ
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Authorized Personnel & Platform Administration Access Only
          </p>
        </div>

        {/* Auth Page Content */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl p-8">
          <Outlet />
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted with 256-bit TLS • SOC2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
};
