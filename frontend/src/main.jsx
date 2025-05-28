import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import { setupInterceptors } from "./service/axiosInstance";
import { useAuthStore } from "./store/authStore";
setupInterceptors(useAuthStore);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
