import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center p-4 selection:bg-brand-pink/20 selection:text-brand-pink">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-black text-white text-lg font-black shadow-sm mb-1">
            I
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Influverse
          </h1>
          <p className="text-xs text-neutral-400">
            Admin Panel
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-7">
          <Outlet />
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[11px] text-neutral-400">
          Influverse &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
