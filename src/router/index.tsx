import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PrivateRoute } from './PrivateRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/dashboard/UsersPage';
import { VerificationPage } from '@/pages/dashboard/VerificationPage';
import { EscrowPage } from '@/pages/dashboard/EscrowPage';
import { TransactionsPage } from '@/pages/dashboard/TransactionsPage';
import { CmsPage } from '@/pages/dashboard/CmsPage';
import { TeamPage } from '@/pages/dashboard/TeamPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // Authentication Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.AUTH.LOGIN,
        element: <LoginPage />,
      },
    ],
  },

  // Protected Dashboard Routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD.OVERVIEW,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.DASHBOARD.USERS,
            element: <UsersPage />,
          },
          {
            path: ROUTES.DASHBOARD.VERIFICATION,
            element: <VerificationPage />,
          },
          {
            path: ROUTES.DASHBOARD.ESCROW,
            element: <EscrowPage />,
          },
          {
            path: ROUTES.DASHBOARD.TRANSACTIONS,
            element: <TransactionsPage />,
          },
          {
            path: ROUTES.DASHBOARD.CMS,
            element: <CmsPage />,
          },
          {
            path: ROUTES.DASHBOARD.TEAM,
            element: <TeamPage />,
          },
          {
            path: ROUTES.DASHBOARD.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
