import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAdmin } from '@/store/slices/authSlice';
import { Avatar } from '@/components/ui/Avatar';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShoppingBag,
  Scale,
  Receipt,
  FileEdit,
  ShieldAlert,
  Settings,
  LifeBuoy,
  LogOut,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const openDisputes = useAppSelector(
    (state) => state.escrow.disputes.filter((d) => d.status === 'open').length
  );

  const navItems = [
    {
      label: 'Overview',
      path: ROUTES.DASHBOARD.OVERVIEW,
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Users',
      path: ROUTES.DASHBOARD.USERS,
      icon: <Users className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Verifications',
      path: ROUTES.DASHBOARD.VERIFICATION,
      icon: <ShieldCheck className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Orders',
      path: ROUTES.DASHBOARD.ORDERS,
      icon: <ShoppingBag className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Disputes',
      path: ROUTES.DASHBOARD.ESCROW,
      icon: <Scale className="w-[18px] h-[18px]" />,
      badge: openDisputes > 0 ? openDisputes : undefined,
    },
    {
      label: 'Transactions',
      path: ROUTES.DASHBOARD.TRANSACTIONS,
      icon: <Receipt className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Support',
      path: ROUTES.DASHBOARD.TICKETS,
      icon: <LifeBuoy className="w-[18px] h-[18px]" />,
    },
    {
      label: 'CMS',
      path: ROUTES.DASHBOARD.CMS,
      icon: <FileEdit className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Team',
      path: ROUTES.DASHBOARD.TEAM,
      icon: <ShieldAlert className="w-[18px] h-[18px]" />,
    },
    {
      label: 'Settings',
      path: ROUTES.DASHBOARD.SETTINGS,
      icon: <Settings className="w-[18px] h-[18px]" />,
    },
  ];

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col h-screen shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-black flex items-center justify-center font-black text-white text-base shadow-sm">
            I
          </div>
          <div>
            <div className="font-black text-sm tracking-tight text-neutral-950 flex items-center gap-1.5">
              <span>INFLUVERSE</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                HQ
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-semibold">
              Admin & Escrow Back-Office
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-neutral-400">
          Core Operations
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.DASHBOARD.OVERVIEW}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 group',
                isActive
                  ? 'bg-brand-black text-white shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      'transition-colors shrink-0',
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Security Status Capsule */}
      <div className="p-3 mx-3 mb-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-neutral-900">
              Escrow Shield Active
            </span>
          </div>
          <Lock className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <p className="text-[10px] text-neutral-500 mt-1 leading-tight font-medium">
          PCI-DSS Level 1 & EU GDPR Enforced
        </p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-neutral-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            size="sm"
            statusIndicator="online"
          />
          <div className="min-w-0">
            <p className="text-xs font-black text-neutral-950 truncate">
              {currentUser?.name}
            </p>
            <p className="text-[10px] font-bold text-neutral-400 capitalize truncate">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out of HQ"
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
