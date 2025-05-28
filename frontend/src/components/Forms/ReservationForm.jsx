import { useState } from "react";
import { createReservation, checkReservationConflict } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useNavigate } from "react-router-dom";

const ReservationForm = ({ parking, onClose, onReservationSuccess }) => {
  const { showNotification } = useNotification();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();

  const now = new Date();
  const minDate = new Date(now.getTime() + 60 * 60 * 1000);

  const toDatetimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const minTime = toDatetimeLocal(minDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const start = new Date(startTime);
    const end = new Date(endTime);
  
    if (end <= start) {
      showNotification("La hora de fin debe ser mayor a la hora de inicio", "error");
      setLoading(false);
      return;
    }

    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
  
    if (!sameDay) {
      showNotification("La reserva debe realizarse para el mismo día", "error");
      setLoading(false);
      return;
    }

    const durationInMinutes = (end - start) / (1000 * 60);
    if (durationInMinutes < 30) {
      showNotification("La reserva debe durar al menos 30 minutos", "error");
      setLoading(false);
      return;
    }
    showConfirm({
      title: "Realizar Reserva",
      message: `¿Deseas confirmar la reserva en el parking: ${parking.name}?`,
      onConfirm: async () => {
        try {
        const availability = await checkReservationConflict(parking.id, startTime, endTime);
        if (!availability) {
          showNotification("El estacionamiento no está disponible en ese horario", "error");
          return;
        }
        await createReservation({
            parkingId: parking.id,
            startTime,
            endTime,
        });
        showNotification("Reserva creada correctamente", "success");
        onReservationSuccess(parking.id);
        onClose();
        navigate("/reservations")
        } catch (error) {
            console.error("Error en la reserva:", error);
            showNotification(error.response?.data?.message || "Error al crear la reserva", "error");
        } finally {
            setLoading(false);
        }
      },
      onCancel: () => {setLoading(false);}
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
      <div className="bg-white m-3 p-6 rounded-md shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">Reservar Estacionamiento</h2>
      <form className="mt-4" onSubmit={handleSubmit}>

        <label className="block mb-1 mt-2">Hora de inicio:</label>
        <input 
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          min={minTime}
          required
        />

        <label className="block mb-1 mt-2">Hora de fin:</label>
        <input 
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
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
            disabled={loading}>{loading ? "Reservando..." : "Reservar"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ReservationForm;