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
    ORDERS: '/orders',
    ESCROW: '/escrow',
    TRANSACTIONS: '/transactions',
    TICKETS: '/tickets',
    CMS: '/cms',
    TEAM: '/team',
    SETTINGS: '/settings',
  },
} as const;
