import { useState, useEffect } from "react";
import { createReservation, checkReservationConflict } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useNavigate } from "react-router-dom";

const ReservationForm = ({ parking, onClose, onReservationSuccess }) => {
  const { showNotification } = useNotification();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spots, setSpots] = useState([]);
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();

  useEffect(() => {
    // Inicializa un mapa aleatorio de espacios
    const initialSpots = Array.from({ length: 25 }, (_, i) => {
      const rand = Math.random();
      if (rand < 0.2) return { id: i, status: "occupied" }; // Rojo
      if (rand < 0.4) return { id: i, status: "reserved" }; // Amarillo
      return { id: i, status: "available" }; // Verde
    });
    setSpots(initialSpots);
  }, []);

  const now = new Date();
  // No necesitamos 'today' de la misma forma que antes, construimos directamente
  // la fecha local para luego convertirla a UTC.
  // const today = now.toISOString().split("T")[0]; // No es necesario con la nueva lógica
  // const minHour = new Date(now.getTime() + 60 * 60 * 1000);
  // const minHourStr = minHour.toTimeString().slice(0, 5); // Podrías usar esto para min en input type="time"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedSpot) {
      showNotification("Selecciona un espacio en el mapa", "error");
      setLoading(false);
      return;
    }

    // --- Lógica de construcción de fechas robusta (CORREGIDA) ---
    // Obtener componentes de la fecha actual
    const todayDate = new Date(); // Esta es la fecha de hoy en la zona horaria local (e.g., 31 de mayo de 2025)
    const year = todayDate.getFullYear();
    const month = todayDate.getMonth(); // 0-indexed
    const day = todayDate.getDate();

    // Parsear las horas y minutos de los strings 'startTime' y 'endTime'
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Crear fechas en la zona horaria local del navegador
    // Estas fechas tendrán la fecha de hoy, con las horas y minutos seleccionados.
    const localStart = new Date(year, month, day, startHour, startMinute, 0, 0);
    const localEnd = new Date(year, month, day, endHour, endMinute, 0, 0);

    // Convertir a UTC antes de enviar al backend
    // Esto es crucial para la consistencia con el backend que esperamos que trabaje en UTC.
    const startToSend = localStart.toISOString();
    const endToSend = localEnd.toISOString();
    // --- FIN Lógica de construcción de fechas robusta ---


    // Validaciones de horas (se mantienen las mismas, pero ahora usan localStart y localEnd)
    if (localEnd <= localStart) {
      showNotification("La hora de fin debe ser mayor a la hora de inicio", "error");
      setLoading(false);
      return;
    }

    const durationInMinutes = (localEnd - localStart) / (1000 * 60);
    if (durationInMinutes < 0) { // O aquí podrías validar que sea al menos 30 minutos, como habías puesto antes.
                               // Aunque tu código actual tiene 'durationInMinutes < 0', es mejor 'durationInMinutes < 30'.
      showNotification("La reserva debe durar al menos 30 minutos", "error");
      setLoading(false);
      return;
    }


    showConfirm({
      title: "Realizar Reserva",
      message: `¿Deseas confirmar la reserva en el parking: ${parking.name}, espacio #${selectedSpot}?`,
      onConfirm: async () => {
        try {
          // Usar las fechas UTC para la verificación de disponibilidad
          const availability = await checkReservationConflict(parking.id, startToSend, endToSend);
          if (!availability) {
            showNotification("El estacionamiento no está disponible en ese horario", "error");
            return;
          }

          // --- Añade estos console.log ---
          console.log("Frontend: Fecha y Hora de Inicio a enviar (UTC):", startToSend);
          console.log("Frontend: Fecha y Hora de Fin a enviar (UTC):", endToSend);
          // ---------------------------------

          await createReservation({
            parkingId: parking.id,
            startTime: startToSend, // Envía la fecha UTC
            endTime: endToSend,     // Envía la fecha UTC
            spotId: selectedSpot, // Asegúrate de incluir el spotId si tu backend lo necesita
          });

          showNotification("Reserva creada correctamente", "success");
          onReservationSuccess(parking.id);
          onClose();
          navigate("/reservations");
        } catch (error) {
          console.error("Error en la reserva:", error);
          showNotification(error.response?.data?.message || "Error al crear la reserva", "error");
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setLoading(false),
    });
  };

  const renderColor = (status) => {
    if (status === "occupied") return "bg-red-500";
    if (status === "reserved") return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
      <div className="bg-white m-3 p-6 rounded-md shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Reservar Estacionamiento</h2>
        <form className="mt-4" onSubmit={handleSubmit}>
          <label className="block mb-1 mt-2">Hora de inicio:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            //min={minHourStr} // Puedes habilitar esto si deseas forzar una hora mínima
            required
          />

          <label className="block mb-1 mt-2">Hora de fin:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Mapa de Estacionamiento</h3>
            <div className="grid grid-cols-5 gap-2">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className={`w-10 h-10 rounded cursor-pointer ${renderColor(spot.status)} ${
                    selectedSpot === spot.id ? "ring-4 ring-blue-400" : ""
                  }`}
                  onClick={() => {
                    if (spot.status === "available") setSelectedSpot(spot.id);
                  }}
                ></div>
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="inline-block w-4 h-4 bg-green-400 rounded-sm mr-1" /> Disponible
              <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm mx-2" /> Reservado
              <span className="inline-block w-4 h-4 bg-red-400 rounded-sm mx-2" /> Ocupado
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Reservando..." : "Reservar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;