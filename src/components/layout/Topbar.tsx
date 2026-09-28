import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAdmin } from '@/store/slices/authSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Scale,
  ShieldCheck,
  Globe,
} from 'lucide-react';

export interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const pendingVerifications = useAppSelector(
    (state) => state.verification.requests.filter((r) => r.status === 'pending').length
  );
  const openDisputes = useAppSelector(
    (state) => state.escrow.disputes.filter((d) => d.status === 'open').length
  );

  const adminMenuItems = [
    {
      id: 'settings',
      label: 'Admin Profile & Security',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate(ROUTES.DASHBOARD.SETTINGS),
    },
    {
      id: 'team',
      label: 'Team & RBAC Matrix',
      icon: <ShieldCheck className="w-4 h-4" />,
      onClick: () => navigate(ROUTES.DASHBOARD.TEAM),
    },
    {
      id: 'logout',
      label: 'Sign Out of HQ',
      danger: true,
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        dispatch(logoutAdmin());
        navigate(ROUTES.AUTH.LOGIN);
      },
    },
  ];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Omni Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search creator handles, brands, dispute IDs..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-lg outline-none transition-all placeholder:text-neutral-400 text-neutral-900 focus:ring-2 focus:ring-brand-pink/20"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Disputed Cases Alert */}
        {openDisputes > 0 && (
          <button
            onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            <span>{openDisputes} Dispute Requires Review</span>
          </button>
        )}

        {/* Pending Verification Alert */}
        {pendingVerifications > 0 && (
          <button
            onClick={() => navigate(ROUTES.DASHBOARD.VERIFICATION)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-pink-50 text-brand-pink border border-pink-200 text-xs font-semibold hover:bg-pink-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
            <span>{pendingVerifications} Pending KYC</span>
          </button>
        )}

        {/* Live Marketplace Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 font-medium px-2 py-1 bg-neutral-50 rounded-md border border-neutral-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Live Staging</span>
        </div>

        {/* Profile Dropdown */}
        <div className="pl-2 border-l border-neutral-200">
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition-colors">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  size="sm"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-neutral-900 leading-tight">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 capitalize">
                    {currentUser?.role?.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:block" />
              </button>
            }
            items={adminMenuItems}
            align="right"
          />
        </div>
      </div>
    </header>
  );
};
