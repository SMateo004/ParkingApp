import { useEffect, useState } from "react";
// Importa la nueva función de la API
import { getHistoricalReservations } from "../../services/api"; // <--- ¡Modificado aquí!

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llama a la nueva función de la API que ya filtra en el backend
        const data = await getHistoricalReservations(); // <--- ¡Modificado aquí!
        setReservations(data); // Ya no necesitas filtrar en el frontend, el backend lo hace
      } catch (error) {
        console.error("Error fetching historical reservations:", error);
        // Opcional: mostrar una notificación de error al usuario
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Historial de Reservas</h1>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 border">Estacionamiento</th>
              <th className="p-2 border">Vehículo</th>
              <th className="p-2 border">Entrada</th>
              <th className="p-2 border">Salida</th>
              <th className="p-2 border">Costo</th>
              <th className="p-2 border">Pagado</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((res) => (
                <tr key={res.id} className="border-t">
                  {/* Usa el operador de encadenamiento opcional (?) para evitar errores si Parking o Vehicle son nulos */}
                  <td className="p-2 border">{res.Parking?.name}</td>
                  <td className="p-2 border">{res.Vehicle?.carPatent}</td>
                  <td className="p-2 border">{new Date(res.entryTime).toLocaleString()}</td>
                  <td className="p-2 border">{new Date(res.exitTime).toLocaleString()}</td>
                  <td className="p-2 border">{res.totalCost} Bs</td>
                  <td className="p-2 border">{res.paid ? "Sí" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">
                  No hay reservas históricas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationHistory;