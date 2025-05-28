import { create } from 'zustand';
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
);