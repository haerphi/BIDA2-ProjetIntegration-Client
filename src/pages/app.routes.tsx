import { Navigate, type RouteObject } from 'react-router-dom';
import AuthPage from './auth/auth.page';
import CourtListingPage from './court/court-listing/court-listing.page';
import NotFoundPage from './errors/not-found.page';
import ContributionPayPage from './contribution/contribution-pay.page';
import ContributionSuccessPage from './contribution/contribution-success.page';
import ContributionCancelPage from './contribution/contribution-cancel.page';
import ConnectedRoute from '../guards/connected-route';
import MemberRoute from '../guards/member-route';
import AdminRoute from '../guards/admin-route';
import MemberListPage from './member/member-list.page';
import NotConnectedRoute from '../guards/not-connected-route';
import DashboardLayout from '../layout/dashboard-layout';
import ContributionListPage from './contribution/contribution-list.page';

const appRoutes: Array<RouteObject> = [
  {
    path: '/error/not-found',
    element: <NotFoundPage />,
  },
  {
    path: '/',
    element: <NotConnectedRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        index: true,
        element: <Navigate to="/auth" replace />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        /*
            User connected but has not paid contribution
        */
        element: <ConnectedRoute />,
        children: [
          {
            path: '/contribution/pay',
            element: <ContributionPayPage />,
          },
          {
            path: '/contribution/success',
            element: <ContributionSuccessPage />,
          },
          {
            path: '/contribution/cancel',
            element: <ContributionCancelPage />,
          },
        ],
      },
      {
        /*
            User connected and has paid contribution
        */
        element: <MemberRoute />,
        children: [
          {
            index: true,
            element: <CourtListingPage />,
          },
          {
            path: '/courts',
            element: <CourtListingPage />,
          },
        ],
      },
      {
        /*
            Admin
        */
        element: <AdminRoute />,
        children: [
          {
            path: '/members',
            element: <MemberListPage />,
          },
          {
            path: '/contributions',
            element: <ContributionListPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/error/not-found" replace />,
  },
];

export default appRoutes;
