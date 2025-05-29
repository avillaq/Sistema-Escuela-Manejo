import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock user data - in a real app, this would come from an API
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
      
      initialize: () => set({ loading: false }),

      login: async (email, password) => {
        // In a real app, you would make an API call here
        return new Promise((resolve) => {
          // Simulate API delay
          setTimeout(() => {
            // Simple validation - in a real app, this would be handled by your backend
            if (email === 'admin@example.com' && password === 'password') {
              set({
                isAuthenticated: true,
                user: mockUser,
                token: 'mock-jwt-token',
                loading: false
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