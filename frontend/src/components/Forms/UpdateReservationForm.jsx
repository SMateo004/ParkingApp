import { useState } from "react";
import { updateReservationEndTime } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const UpdateReservationForm = ({ reservation, onClose, onUpdate }) => {
  const [newEndTime, setNewEndTime] = useState(reservation.endTime);
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const oldEnd = new Date(reservation.endTime);
    const newEnd = new Date(newEndTime);

    const sameDay =
    oldEnd.getFullYear() === newEnd.getFullYear() &&
    oldEnd.getMonth() === newEnd.getMonth() &&
    oldEnd.getDate() === newEnd.getDate();

    if (newEnd <= oldEnd) {
      showNotification("La nueva hora de salida debe ser mayor a la actual", "error");
      setLoading(false);
      return;
    }

    if (!sameDay) {
      showNotification("La nueva hora debe ser en el mismo día que la reserva original", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await updateReservationEndTime(reservation.id, newEndTime);
      showNotification("Hora de salida actualizada", "success");
      onUpdate(res);
      onClose();
    } catch (err) {
      showNotification(err.response?.data?.message || "Error al actualizar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
      <div className="bg-white m-3 p-6 rounded-md shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Actualizar Hora de Salida</h3>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Nueva hora de salida:</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            required
          />

          <div className="flex justify-end mt-4 space-x-2">
            <button onClick={onClose} type="button" className="px-4 py-2 bg-gray-300 rounded">
              Cancelar
            </button>
            <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}>{loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateReservationForm;