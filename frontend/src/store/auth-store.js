import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1'
};

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: true,
      rol: '',
      
      initialize: () => set({ loading: false }),

      login: async (username, password) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
              set({
                isAuthenticated: true,
                user: mockUser,
                token: 'mock-jwt-token',
                loading: false,
                rol: username
              });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 800);
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null
        });
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}