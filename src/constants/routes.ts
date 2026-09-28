export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
  },
  DASHBOARD: {
    OVERVIEW: '/',
    ANALYTICS: '/analytics',
    USERS: '/users',
    VERIFICATION: '/verification',
    ESCROW: '/escrow',
    TRANSACTIONS: '/transactions',
    PACKAGES: '/packages',
    CMS: '/cms',
    TEAM: '/team',
    SETTINGS: '/settings',
  },
} as const;
