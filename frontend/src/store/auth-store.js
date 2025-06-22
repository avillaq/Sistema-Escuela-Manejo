import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
};

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      id: null,
      token: null,
      rol: '',

      login: (data) => {
        set({
          isAuthenticated: true,
          id: data.id,
          rol: data.rol,
          token: data.access_token,
        });
        localStorage.setItem('token', data.access_token);
      },
      logout: () => {
        set({
          isAuthenticated: false,
          id: null,
          rol: '',
          token: null,
        });
        localStorage.removeItem('token');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        rol: state.rol,
        id: state.id
      })
    }
  )
);