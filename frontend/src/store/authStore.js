/* import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      access_token: null,
      isAuthenticated: false,
      setAccessToken: (access_token) => {
        set({
          access_token
        });
      },
      setAuthtenticated: () =>
        set({
          isAuthenticated : true
        }),
      setLogout: () =>
        set({
          access_token: null,
          isAuthenticated: false
        })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        access_token: state.access_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,
      
      // Initialize by checking localStorage (handled by persist)
      initialize: () => set({ loading: false }),
      
      // Login action
      login: (userData) => set({ user: userData, loading: false }),
      
      // Logout action
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user data
    }
  )
);

// Initialize auth state when app loads
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}