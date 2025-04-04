import { useState, useEffect, useContext } from "react";
import { createReservation } from "../../services/api";
import { getAllVehicles } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const ReservationForm = ({ parking, onClose, onReservationSuccess }) => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchVehicles = async () => {
      const data = await getAllVehicles(user?.id);
      setVehicles(data);
    };
    fetchVehicles();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createReservation({
        vehicleId,
        parkingId: parking.id,
        startTime,
        endTime,
      });
      showNotification("Reserva creada correctamente", "success");
      onReservationSuccess(parking.id);
      onClose();
    } catch (error) {
      console.error("Error en la reserva:", error);
      showNotification("Error al crear la reserva", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
      <div className="bg-white m-3 p-6 rounded-md shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">Reservar Estacionamiento</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <label className="block mb-2">Selecciona un vehículo:</label>
        <select 
          value={vehicleId} 
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md" 
          required
        >
          <option value="">Seleccione</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.carPatent} - {vehicle.model}
            </option>
          ))}
        </select>

        <label className="block mb-2">Hora de inicio:</label>
        <input 
          type="datetime-local" 
          value={startTime} onChange={(e) => setStartTime(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md"
          required 
        />

        <label className="block mb-2">Hora de fin:</label>
        <input 
          type="datetime-local" 
          value={endTime} onChange={(e) => setEndTime(e.target.value)} 
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