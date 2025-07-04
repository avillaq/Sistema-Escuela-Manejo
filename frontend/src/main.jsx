import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { setupInterceptors } from "@/service/axiosInstance";
import { useAuthStore } from "@/store/auth-store";
setupInterceptors(useAuthStore);
createRoot(document.getElementById('root')).render(
  <App />
)
