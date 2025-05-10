import { createContext, useState, useContext } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmData, setConfirmData] = useState(null);

  const showConfirm = ({ title, message, onConfirm, onCancel, confirmText = "Sí", cancelText = "No" }) => {
    setConfirmData({ title, message, onConfirm, onCancel, confirmText, cancelText });
  };

  const handleConfirm = () => {
    confirmData.onConfirm();
    setConfirmData(null);
  };

  const handleCancel = () => {
    confirmData.onCancel();
    setConfirmData(null);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmData && (
        <ConfirmDialog
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmText={confirmData.confirmText}
          cancelText={confirmData.cancelText}
        />
      )}
    </ConfirmContext.Provider>
  );
};