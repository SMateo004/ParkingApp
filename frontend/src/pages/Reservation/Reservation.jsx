import { useState, useEffect } from "react";
import { getReservations, cancelReservation } from "../../services/api";
import UpdateReservationForm from "../../components/Forms/UpdateReservationForm";
import PaymentModal from "../Payment/Payment";
import { useConfirm } from "../../context/ConfirmContext";
import { useNotification } from "../../context/NotificationContext";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);
  const [minDate, setMinDate] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { showConfirm } = useConfirm();
  const { showNotification } = useNotification();


  useEffect(() => {
    const fetchData = async () => {
      const data = await getReservations();
      setReservations(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    setMinDate(new Date(now.getTime() + 30 * 30 * 1000));
  }, []);

  const handlePaymentClick = (reservation) => {
    setSelectedReservation(reservation);
  };
  
  const handleCancelClick = (reservation) => {
    showConfirm({
      title: "Cancelar reserva",
      message: "¿Estás seguro de que deseas cancelar esta reserva?",
      onConfirm: async () => {
        try {
          await cancelReservation(reservation.id);
          setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
          showNotification("Reserva cancelada", "success");
        } catch {
          showNotification("Error al cancelar reserva", "error");
        }
      },
      onCancel: () => setSelectedReservation(null)
    });
  };
  
  return (
    <div className="container mx-auto p-4 mt-17">
      <h1 className="text-xl font-bold mb-4">Mis Reservas</h1>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2">Nombre Estacionamiento</th>
              <th className="border p-2">Placa Vehiculo</th>
              <th className="border p-2">Hora Reserva Entrada</th>
              <th className="border p-2">Hora Reserva Salida</th>
              <th className="border p-2">Costo</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ?
              reservations.map((reservation) => (
                <tr key={reservation.id} className="border">
                  <td className="border p-2">{reservation.Parking.name}</td>
                  <td className="border p-2">{reservation.Vehicle.carPatent}</td>
                  <td className="border p-2">{new Date(reservation.startTime).toLocaleString()}</td>
                  <td className="border p-2">{new Date(reservation.endTime).toLocaleString()}</td>
                  <td className="border p-2">{reservation.totalCost} Bs/h</td>
                  <td className="border p-2">
                    {minDate < new Date(reservation.endTime) || !reservation.paid ? ( 
                      <div className="flex justify-center col-span-3 space-x-2">
                        <button
                          onClick={() => setEditReservation(reservation)}
                          className="bg-pink-600 text-white px-2 py-1 rounded hover:bg-pink-800"
                        >
                          Editar Salida
                        </button>
                        <button
                          onClick={() => handleCancelClick(reservation)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <td>
                        {!reservation.paid && (
                          <button
                            onClick={() => handlePaymentClick(reservation)}
                            className="bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-700"
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    )}
                  </td>
                </tr>
            )):(
              <tr>
                <td colSpan="8" className="py-4 px-4 text-center text-gray-500">No se encontraron resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editReservation && (
        <UpdateReservationForm
          reservation={editReservation}
          onClose={() => setEditReservation(null)}
          onUpdate={(updated) => {
            setReservations((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
        />
      )}
      {selectedReservation && (
        <PaymentModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onPaymentSuccess={(updated) => {
            setReservations((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
        />
      )}
    </div>
  );
};

export default Reservation;