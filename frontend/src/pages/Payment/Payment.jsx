// src/components/PaymentModal.jsx
import { useState } from "react";
import QRCode from "react-qr-code";
import { markReservationAsPaid, processExtraPayment } from "../../services/api"; // Asegúrate de importar ambos
import { useNotification } from "../../context/NotificationContext";
import CardPaymentForm from "../../components/Forms/CardPaymentForm";

const PaymentModal = ({ reservation, amountToPay, isExtraPayment, onClose, onPaymentSuccess }) => {
  const { showNotification } = useNotification();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("qr");
  const [confirmed, setConfirmed] = useState(false);

  const qrContent = `
    Parking APP
    Estacionamiento: ${reservation.Parking?.name}
    Monto a pagar: ${amountToPay} Bs
    ID Reserva: ${reservation.id}
    ${isExtraPayment ? "Tipo: Pago Adicional por tiempo excedido" : `Entrada: ${new Date(reservation.startTime).toLocaleString()}\nSalida: ${new Date(reservation.endTime).toLocaleString()}`}
  `.trim();

  const handlePaymentProcessing = async () => {
    setProcessing(true);
    try {
      let updatedReservation;
      if (isExtraPayment) {
            // Llama a la función específica para pago extra (esta parece enviar el monto)
            updatedReservation = await processExtraPayment(reservation.id, amountToPay);
        } else {
            // Llama a la función para pago normal (esta SOLO envía el reservation.id en la URL)
            updatedReservation = await markReservationAsPaid(reservation.id);
        }
      setProcessing(false);
      setConfirmed(true);
      showNotification("Pago realizado con éxito", "success");
      if (onPaymentSuccess) {
        onPaymentSuccess(updatedReservation);
      }
      setTimeout(onClose, 2000);
    } catch (err) {
      setProcessing(false);
      const errorMessage = err.response?.data?.message || err.message || "Error al procesar el pago";
      showNotification(errorMessage, "error");
    }
  };

  const handleSimulatedPayment = () => {
    // Simula una demora para UX, luego procesa el pago
    setTimeout(async () => {
      await handlePaymentProcessing();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md sm:max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {isExtraPayment ? "Pago Extra" : "Pago de Reserva"}
        </h3>
        <p className="mb-2 text-gray-700">Estacionamiento: <strong className="text-gray-900">{reservation.Parking?.name}</strong></p>
        <p className="mb-4 text-gray-700">Monto a pagar: <strong className="text-2xl text-blue-600">{amountToPay} Bs</strong></p>

        <div className="mb-6">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setMethod("qr")}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-l-md focus:outline-none transition-colors duration-150 ease-in-out
                ${method === "qr" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Pagar con QR
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-r-md focus:outline-none transition-colors duration-150 ease-in-out
                ${method === "card" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Pagar con Tarjeta
            </button>
          </div>
        </div>

        {!confirmed && (
          <>
            {method === "qr" && (
              <div className="text-center">
                <div className="flex justify-center my-4 p-2 border border-gray-200 rounded-md bg-white inline-block">
                  <QRCode value={qrContent} size={180} level="H" />
                </div>
                <p className="text-xs text-gray-500 mb-4">Escanea el código QR para realizar el pago.</p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
                    disabled={processing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSimulatedPayment}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? "Procesando..." : `Simular Pago QR (${amountToPay} Bs)`}
                  </button>
                </div>
              </div>
            )}

            {method === "card" && (
              <CardPaymentForm
                reservation={reservation}
                amountToPay={amountToPay}
                isExtraPayment={isExtraPayment}
                onSuccess={(updatedData) => {
                  setProcessing(false);
                  setConfirmed(true);
                  showNotification("Pago con tarjeta realizado con éxito", "success");
                  if (onPaymentSuccess) {
                    onPaymentSuccess(updatedData);
                  }
                  setTimeout(onClose, 2000);
                }}
                onProcessingChange={setProcessing}
                onClose={onClose}
              />
            )}
          </>
        )}

        {confirmed && (
          <div className="text-center py-6">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-green-600 font-semibold text-lg">Pago Confirmado</p>
            <p className="text-sm text-gray-600">Gracias por tu pago.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;