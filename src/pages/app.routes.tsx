import type { RouteObject } from 'react-router-dom';
import AuthPage from './auth/auth.page';
import CourtListingPage from './court/court-listing/court-listing.page';
import NotFoundPage from './errors/not-found.page';
import ContributionPayPage from './contribution/contribution-pay.page';
import ContributionSuccessPage from './contribution/contribution-success.page';
import ContributionCancelPage from './contribution/contribution-cancel.page';
import ConnectedRoute from '../guards/connected-route';
import MemberRoute from '../guards/member-route';

const appRoutes: Array<RouteObject> = [
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
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
        path: '/',
        element: <CourtListingPage />,
      },
      {
        path: '/courts',
        element: <CourtListingPage />,
      },
    ],
  },
];

export default appRoutes;
