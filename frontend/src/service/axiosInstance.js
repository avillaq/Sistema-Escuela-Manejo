import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_CONFIG } from "@/config/api.config";

export const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupInterceptors = (useAuthStore) => {
  api.interceptors.request.use(
    async (config) => {
      const { token, logout } = useAuthStore.getState();
      
      if (token) {
        const tokenData = jwtDecode(token);
        const isExpired = tokenData.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};