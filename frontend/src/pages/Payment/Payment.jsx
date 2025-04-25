import { useState } from "react";
import QRCode from "react-qr-code";
import { markReservationAsPaid } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import CardPaymentForm from "../../components/Forms/CardPaymentForm";

const PaymentModal = ({ reservation, onClose, onPaymentSuccess }) => {
  const { showNotification } = useNotification();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("qr");
  const [confirmed, setConfirmed] = useState(false);

  const qrContent = `
    Parking APP
    Estacionamiento: ${reservation.Parking?.name}
    Monto a pagar: ${reservation.totalCost} Bs
    Entrada: ${new Date(reservation.startTime).toLocaleString()}
    Salida: ${new Date(reservation.endTime).toLocaleString()}
    ID Reserva: ${reservation.id}
    `.trim();

  const handleFakeQRPayment = () => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        const updated = await markReservationAsPaid(reservation.id);
        setConfirmed(true);
        showNotification("Pago realizado con éxito", "success");
        onPaymentSuccess(updated);
        setTimeout(onClose, 2000);
      } catch (err) {
        showNotification("Error al procesar el pago", err);
        onClose();
      }
    }, 6000);
  };

  return (
<div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-[400px] max-w-full">
        <h3 className="text-xl font-bold mb-4">Simular Pago</h3>
        <p className="mb-2">Monto a pagar: <strong>{reservation.totalCost} Bs</strong></p>

        <div className="mb-4">
          <button
            onClick={() => setMethod("qr")}
            className={`px-4 py-2 rounded-l ${method === "qr" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >QR</button>
          <button
            onClick={() => setMethod("card")}
            className={`px-4 py-2 rounded-r ${method === "card" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >Tarjeta</button>
        </div>

        {method === "qr" && !confirmed && (
          <>
            <div className="flex justify-center my-4">
              <QRCode value={qrContent} size={180} />
            </div>
            <div className="flex justify-end col-span-3 space-x-2 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                  Cancelar
              </button>  
              <button
                onClick={handleFakeQRPayment}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={processing}
              >
                {processing ? "Procesando pago..." : "Realizar pago"}
              </button>
            </div>
          </>
        )}

        {method === "card" && (
          <CardPaymentForm
            reservation={reservation}
            onSuccess={(updated) => {
              onPaymentSuccess(updated);
              setConfirmed(true);
              setTimeout(onClose, 2000);
            }}
            onClose={onClose}
          />
        )}

        {confirmed && (
          <p className="text-green-600 font-semibold mt-4 text-center">Pago confirmado</p>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;