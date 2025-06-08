import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_CONFIG } from "@/config/api.config";
import { useAuthStore } from '@/store/auth-store';
import { addToast } from '@heroui/react';

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
      const { access_token, setLogout } = useAuthStore.getState();
  
      if (access_token) {
        
        /*const tokenData = jwtDecode(access_token);
        const isExpired = tokenData.exp * 1000 < Date.now();
        if (isExpired) {
          setLogout();
        }*/
        config.headers.Authorization = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};