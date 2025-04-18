import { useContext, useEffect, useState } from "react";
import { getAdminReservations, markReservationEntry } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const AdminReservationPage = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    try {
        const data = await getAdminReservations();
        setReservations(data);
    } catch (error) {
        showNotification("Error al cargar reservas", error);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchReservations();
  }, [user]);

  const handleMarkEntry = async (id) => {
    try {
      await markReservationEntry(id);
      showNotification("Ingreso registrado", "success");
      fetchReservations();
    } catch {
      showNotification("Error al registrar ingreso", "error");
    }
  };

  return (
    <div className="container mx-auto p-4 mt-17">
      <h2 className="text-xl font-bold mb-4">Reservas de mi Estacionamiento</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr className="bg-gray-800 text-white">
            <th className="border p-2">Vehículo</th>
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Hora Inicio Reserva</th>
            <th className="border p-2">Hora Fin Reserva</th>
            <th className="border p-2">Ingreso</th>
            <th className="border p-2">Salida</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="text-center border-b">
              <td className="border p-2">{r.Vehicle?.carPatent}</td>
              <td className="border p-2">{r.User?.name}</td>
              <td className="border p-2">{new Date(r.startTime).toLocaleString()}</td>
              <td className="border p-2">{new Date(r.endTime).toLocaleString()}</td>
              <td className="border p-2">{r.entryTime ? new Date(r.entryTime).toLocaleString() : "--"}</td>
              <td className="border p-2">{r.exitTime ? new Date(r.exitTime).toLocaleString() : "--"}</td>
              <td className="border p-2">
                {!r.entryTime && (
                  <button
                    onClick={() => handleMarkEntry(r.id)}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Marcar Entrada
                  </button>
                )}
                {r.paid && (
                  <button
                    onClick={() => {}}
                    className="bg-pink-600 w-32 text-white px-2 py-1 rounded hover:bg-pink-800"
                  >
                    Marcar Salida
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservationPage;