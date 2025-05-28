import { BrowserRouter, Routes, Route } from 'react-router';
import { routes } from './routes';
import { Layout } from '../components/Layout';

export const RouterProvider = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {routes.map(({ path, element: Element }) => (
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