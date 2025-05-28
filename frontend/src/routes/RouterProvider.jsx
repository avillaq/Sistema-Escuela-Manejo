import { BrowserRouter, Routes, Route } from 'react-router';
import { publicRoutes, protectedRoutes } from '@/routes/routes';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export const RouterProvider = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        {publicRoutes.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={<Element />}
          />
        ))}
        
        {/* Rutas protegidas con DashboardLayout */}
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map(({ path, element: Element }) => (
            <Route
              key={path}
              path={path}
              element={<Element />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};