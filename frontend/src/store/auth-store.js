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
      loading: true,
      rol: '',

      initialize: () => set({ loading: false }),

      login: (data) => {
        set({
          isAuthenticated: true,
          id: data.usuario_id,
          rol: data.rol,
          token: data.access_token,
          loading: false
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          id: null,
          rol: '',
          token: null,
          loading: false
        });
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}