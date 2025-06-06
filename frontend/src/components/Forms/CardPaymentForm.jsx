// src/components/Forms/CardPaymentForm.jsx
import { useState } from "react";
import { markReservationAsPaid, processExtraPayment } from "../../services/api"; // Asegúrate de importar ambos
import { useNotification } from "../../context/NotificationContext";
import visaLogo from "../../assets/visa.png";
import masterLogo from "../../assets/mastercard.png";

const CardPaymentForm = ({ reservation, amountToPay, isExtraPayment, onSuccess, onClose, onProcessingChange }) => {
  const { showNotification } = useNotification();
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const getCardType = () => {
    if (cardNumber.startsWith("4")) return visaLogo;
    if (cardNumber.startsWith("5")) return masterLogo;
    return null;
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = input.match(/.{1,4}/g)?.join("-") || "";
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let input = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    if (input.length >= 3) {
      input = input.slice(0, 2) + "/" + input.slice(2);
    }
    setExpiry(input);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (onProcessingChange) onProcessingChange(true); // Notifica al padre

    try {
      // Simula una demora de red y procesamiento
      await new Promise((resolve) => setTimeout(resolve, 3000));

      let updatedReservation;
      if (isExtraPayment) {
        updatedReservation = await processExtraPayment(reservation.id, amountToPay); // Pasa el monto
      } else {
        updatedReservation = await markReservationAsPaid(reservation.id);
      }

      showNotification("Pago realizado exitosamente", "success");
      onSuccess(updatedReservation);
    } catch (err) {
      console.error("Error en CardPaymentForm:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error al procesar el pago";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
      if (onProcessingChange) onProcessingChange(false); // Notifica al padre que ha terminado
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (campos de formulario) */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Número de tarjeta:</label>
        <input
          type="text"
          className="w-full border p-2 rounded pl-12 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0000-0000-0000-0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          required
        />
        {getCardType() && (
          <img src={getCardType()} alt="card" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-5" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre en tarjeta:</label>
        <input
          type="text"
          className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Expira (MM/AA):</label>
          <input
            type="text"
            className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="MM/AA"
            maxLength="5"
            value={expiry}
            onChange={handleExpiryChange}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">CVV:</label>
          <input
            type="password"
            className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
            maxLength="3"
            required
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end col-span-3 space-x-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar ${amountToPay} Bs`}
        </button>
      </div>
    </form>
  );
};

export default CardPaymentForm;