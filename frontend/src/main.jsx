import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from "react-toastify";
import { ConfirmProvider } from './context/ConfirmContext';
import AppRoutes from "./routes/index";
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ConfirmProvider>
          <AppRoutes />
          <ToastContainer />
        </ConfirmProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
