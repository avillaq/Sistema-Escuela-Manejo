import { BrowserRouter, Routes, Route, useNavigate, useHref } from 'react-router';
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { publicRoutes, protectedRoutes } from './routes';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';


const NextUIRouteProvider = () => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider
        maxVisibleToasts={1}
        toastProps={{ timeout: 2000 }}
      />
      <Routes>
        {/* Rutas públicas */}
        {publicRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}

        {/* Rutas protegidas con DashboardLayout */}
        <Route
          element={<DashboardLayout />}>
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={element}
            />
          ))}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
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