import { useState } from "react";
import { markReservationAsPaid } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import visaLogo from "../../assets/visa.png";
import masterLogo from "../../assets/mastercard.png";

const CardPaymentForm = ({ reservation, onSuccess, onClose }) => {
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const updated = await markReservationAsPaid(reservation.id);
      showNotification("Pago realizado exitosamente", "success");
      onSuccess(updated);
    } catch (err) {
      console.log(err)
      showNotification("Error al procesar el pago", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="block text-sm">Número de tarjeta:</label>
        <input
          type="text"
          className="w-full border p-2 rounded pl-12"
          placeholder="0000-0000-0000-0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          required
        />
        {getCardType() && (
          <img src={getCardType()} alt="card" className="absolute left-2 rigt-2 top-8 w-8 h-5" />
        )}
      </div>

      <div>
        <label className="block text-sm">Nombre en tarjeta:</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block text-sm">Expira:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="MM/AA"
            maxLength="5"
            value={expiry}
            onChange={handleExpiryChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm">CVV:</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
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
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancelar
        </button>  
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar ${reservation.totalCost} Bs`}
        </button>
      </div>
    </form>
  );
};

export default CardPaymentForm;