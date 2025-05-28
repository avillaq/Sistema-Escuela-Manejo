export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  endpoints: {
    auth: {
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      refresh: "/auth/refresh",
    },
  }
};