import { BrowserRouter, Routes, Route, useNavigate, useHref } from 'react-router';
import { HeroUIProvider } from "@heroui/react";
import { publicRoutes, protectedRoutes } from './routes';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';


const NextUIRouteProvider = () => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
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
    </HeroUIProvider>
  )
}

export const RouterProvider = () => {

  return (
    <BrowserRouter>
      <NextUIRouteProvider />
    </BrowserRouter>
  );
};