import { useContext, useEffect, useState } from "react";
import {
  getAdminReservations,
  markReservationEntry,
  markReservationExit
} from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import MarkEntryModal from "./MarkModal";

const AdminReservationPage = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("entry");

  const fetchReservations = async () => {
    try {
      const data = await getAdminReservations();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredReservations = data.filter(reservation => {
        const reservationStartTime = new Date(reservation.startTime);
        reservationStartTime.setHours(0, 0, 0, 0);

        return reservationStartTime.getTime() === today.getTime();
      });

      setReservations(filteredReservations);

    } catch (error) {
      console.error(error);
      showNotification("Error al cargar reservas", "error");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchReservations();
  }, [user]);

  // Maneja marcado de entrada: solo 5 minutos antes o 15 minutos después del inicio de reserva
  const handleMarkEntry = async (reservationId, startTime) => {
    const now = new Date();
    const startTimeDate = new Date(startTime);
    const minTime = new Date(startTimeDate.getTime() - 5 * 60 * 1000);   // 5 minutos antes
    const maxTime = new Date(startTimeDate.getTime() + 15 * 60 * 1000); // 15 minutos después

    if (now < minTime || now > maxTime) {
      showNotification("No puede marcar entrada ahora, solo 5 min antes o 15 min después de la reserva", "error");
      return;
    }

    try {
      await markReservationEntry(reservationId);
      showNotification("Ingreso registrado", "success");

      setReservations(prevReservations =>
        prevReservations.map(res =>
          res.id === reservationId ? { ...res, entryTime: new Date().toISOString() } : res
        )
      );

    } catch (error) {
      console.error(error);
      showNotification("Error al registrar ingreso", "error");
    }
  };

  // Maneja marcado de salida: solo si está pagada y dentro de 5 minutos posteriores al pago
  const handleMarkExit = async (reservation) => {
  // 1. Validaciones básicas de pago
  if (!reservation.paid) {
    showNotification("No puede marcar salida sin haber pagado", "error");
    return;
  }
  if (!reservation.paidAt) {
    showNotification("No se encontró registro de pago, vuelva a pagar", "error");
    return;
  }

  // 2. Extracción y validación del parkingId (¡CRÍTICO!)
  // Usamos el encadenamiento opcional (?.) para evitar errores si 'Parking' es undefined
  const parkingId = reservation.Parking?.id; 

  if (!parkingId) {
    showNotification("Error: No se encontró el ID del estacionamiento para esta reserva. Contacte a soporte.", "error");
    console.error("Error: parkingId es undefined para la reserva:", reservation);
    return; // Detenemos la ejecución si no tenemos el parkingId
  }

  // 3. Lógica de tiempo límite para salida gratuita
  const now = new Date();
  const endTime = new Date(reservation.endTime);
  const limitTime = new Date(endTime.getTime() + 1 * 60 * 1000); // 1 minuto después del pago

  // --- Mantenemos los console.logs para depuración si aún los necesitas ---
  console.log("DEBUG: Objeto de reserva completo en handleMarkExit:", reservation);
  console.log("DEBUG: Valor de parkingId a enviar:", parkingId);
  console.log("DEBUG: reservation.paidExtra en handleMarkExit:", reservation.paidExtra);
  console.log("DEBUG: Tipo de reservation.paidExtra:", typeof reservation.paidExtra);
  console.log("DEBUG: ¿now > limitTime?", now > limitTime);
  console.log("DEBUG: ¿reservation.paidExtra === false?", reservation.paidExtra === false);
  console.log("DEBUG: Condición final (now > limitTime && reservation.paidExtra === false):", now > limitTime && reservation.paidExtra === false);
  // --- FIN DE LOS CONSOLE.LOGS ---

  // 4. Lógica de pago extra (con comparación estricta)
  // Usamos '===' para asegurar que 'paidExtra' sea exactamente 'false'
  if (now > limitTime && reservation.paidExtra === false) { 
    showNotification("Tiempo para salida gratuito expirado. El usuario debe pagar el extra.", "error");
    return;
  }

  // Si llegamos aquí, significa que la salida es válida (tiempo no expirado O pagó extra)
  try {
    // Enviamos el reservation.id y el parkingId que ya validamos
    await markReservationExit(reservation.id, parkingId); 
    showNotification("Salida registrada", "success");

    // Actualizamos el estado para eliminar la reserva de la lista
    setReservations(prevReservations =>
      prevReservations.filter(res => res.id !== reservation.id)
    );

  } catch (error) {
    console.error("Error al registrar salida:", error); // Log más descriptivo
    // Si el backend envía un mensaje de error específico, puedes mostrarlo
    showNotification(error.response?.data?.message || "Error al registrar salida", "error");
  }
};

  const openModal = (mode = "entry") => {
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    fetchReservations(); // Mantenemos esto aquí porque el modal podría agregar nuevas reservas
  };

  return (
    <div className="container mx-auto p-4 mt-17">
      <h2 className="text-xl font-bold mb-4">Reservas de mi Estacionamiento</h2>

      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={() => openModal("entry")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Escanear Entrada
        </button>
        <button
          onClick={() => openModal("exit")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Escanear Salida
        </button>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr className="bg-gray-800 text-white">
              <th className="border p-2">Vehículo</th>
              <th className="border p-2">Usuario</th>
              <th className="border p-2">Hora Inicio Reserva</th>
              <th className="border p-2">Hora Fin Reserva</th>
              <th className="border p-2">Ingreso</th>
              <th className="border p-2">Salida</th>
              <th className="border p-2">Costo</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((r) => (
                <tr key={r.id} className="text-center border">
                  <td className="border p-2">{r.Vehicle?.carPatent}</td>
                  <td className="border p-2">{r.User?.name}</td>
                  <td className="border p-2">{new Date(r.startTime).toLocaleString()}</td>
                  <td className="border p-2">{new Date(r.endTime).toLocaleString()}</td>
                  <td className="border p-2">{r.entryTime ? new Date(r.entryTime).toLocaleString() : "--"}</td>
                  <td className="border p-2">{r.exitTime ? new Date(r.exitTime).toLocaleString() : "--"}</td>
                  <td className="border p-2">{r.totalCost} Bs/h</td>
                  <td className="border p-2 space-y-1">
                    {!r.entryTime && (
                      <button
                        onClick={() => handleMarkEntry(r.id, r.startTime)}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Marcar Entrada
                      </button>
                    )}
                    {r.paid && !r.exitTime && (
                      <button
                        onClick={() => handleMarkExit(r)}
                        className="bg-pink-600 w-32 text-white px-2 py-1 rounded hover:bg-pink-800"
                      >
                        Marcar Salida
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <MarkEntryModal mode={modalMode} onClose={closeModal} />
      )}
    </div>
  );
};

export default AdminReservationPage;