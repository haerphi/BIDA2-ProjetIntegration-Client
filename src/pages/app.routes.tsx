import type { RouteObject } from 'react-router-dom';
import AuthPage from './auth/auth.page';
import CourtListingPage from './court/court-listing/court-listing.page';
import NotFoundPage from './errors/not-found.page';

const appRoutes: Array<RouteObject> = [
  {
    path: '/',
    element: <CourtListingPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/courts',
    element: <CourtListingPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default appRoutes;
