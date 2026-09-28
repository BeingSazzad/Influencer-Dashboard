import React, { useState, useRef, useEffect } from 'react';
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
  Users,
  Check,
} from 'lucide-react';

export interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const pendingVerifications = useAppSelector(
    (state) => state.verification.requests.filter((r) => r.status === 'pending').length
  );
  const openDisputes = useAppSelector(
    (state) => state.escrow.disputes.filter((d) => d.status === 'open').length
  );

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [readNotifs, setReadNotifs] = useState<Record<string, boolean>>({});

  const notifications = [
    {
      id: 'notif-1',
      title: 'Verification Request',
      description: `${pendingVerifications} creator application${pendingVerifications > 1 ? 's' : ''} awaiting KYC review`,
      time: '10m ago',
      route: ROUTES.DASHBOARD.VERIFICATION,
      show: pendingVerifications > 0,
    },
    {
      id: 'notif-2',
      title: 'Escrow Dispute',
      description: `${openDisputes} campaign dispute${openDisputes > 1 ? 's' : ''} requiring arbitration`,
      time: '25m ago',
      route: ROUTES.DASHBOARD.ESCROW,
      show: openDisputes > 0,
    },
    {
      id: 'notif-3',
      title: 'Support Ticket',
      description: 'TCK-501: Payout inquiry from Creator Sophie Kim',
      time: '1h ago',
      route: ROUTES.DASHBOARD.TICKETS,
      show: true,
    },
  ].filter((n) => n.show);

  const unreadCount = notifications.filter((n) => !readNotifs[n.id]).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const markAllRead = () => {
    const all: Record<string, boolean> = {};
    notifications.forEach((n) => {
      all[n.id] = true;
    });
    setReadNotifs(all);
  };

  const adminMenuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate(ROUTES.DASHBOARD.SETTINGS),
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="w-4 h-4" />,
      onClick: () => navigate(ROUTES.DASHBOARD.TEAM),
    },
    {
      id: 'logout',
      label: 'Sign Out',
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
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-lg outline-none transition-all placeholder:text-neutral-400 text-neutral-900 focus:ring-2 focus:ring-brand-pink/20"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-pink ring-2 ring-white" />
            )}
          </button>

          {/* Notification Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-50 text-brand-pink">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isRead = readNotifs[notif.id];
                    return (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setReadNotifs((prev) => ({ ...prev, [notif.id]: true }));
                          setIsNotifOpen(false);
                          navigate(notif.route);
                        }}
                        className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 hover:bg-neutral-50 ${
                          !isRead ? 'bg-pink-50/20' : ''
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !isRead ? 'bg-brand-pink' : 'bg-neutral-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-neutral-900 truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                            {notif.description}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
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
