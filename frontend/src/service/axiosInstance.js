import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_CONFIG } from "@/config/api.config";

export const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupInterceptors = (useAuthStore) => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      const { access_token, setLogout } = useAuthStore.getState();
  
      if (access_token) {
        const tokenData = jwtDecode(access_token);
        const isExpired = tokenData.exp * 1000 < Date.now();
        
        if (isExpired) {
          // As we will not use the refresh functionality of the backend because we 
          // want a simple code, we will just remove the token from the local storage
          setLogout();
        }
        
        config.headers.Authorization = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};