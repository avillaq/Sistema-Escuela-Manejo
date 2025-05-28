import { Dashboard } from '@/pages/Dashboard';
import { NotFound } from '@/pages/NotFound';
import { Navigate } from 'react-router';


export const routes = [
  {
    path: '/',
    element: Dashboard,
  },
  {
    path: '*',
    element: NotFound,
  },
];