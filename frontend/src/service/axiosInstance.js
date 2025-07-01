import axios from "axios";
import { API_CONFIG } from "@/config/api.config";

export const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para evitar múltiples requests de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const setupInterceptors = (useAuthStore) => {
  // Request interceptor
  api.interceptors.request.use(
    async (config) => {
      const { token } = useAuthStore.getState();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - maneja errores 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const { token, logout, updateToken } = useAuthStore.getState();

      if (error.response?.status === 401 && !originalRequest._retry && token) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          const refreshResponse = await axios.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.refresh}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const newToken = refreshResponse.data.access_token;
          
          // Actualizar token
          updateToken(newToken);
          
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      return Promise.reject(error);
    }
  );
};