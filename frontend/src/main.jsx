import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/index";
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <ToastContainer />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
