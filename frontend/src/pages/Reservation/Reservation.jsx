import { useState, useEffect } from "react";
import { getReservations } from "../../services/api";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReservations();
      setReservations(data);
    };
    fetchData();
  }, []);


  return (
    <div className="container mx-auto p-4 mt-17">
      <h1 className="text-xl font-bold mb-4">Mis Reservas</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border p-2">Nombre Estacionamiento</th>
            <th className="border p-2">Placa Vehiculo</th>
            <th className="border p-2">Hora Entrada</th>
            <th className="border p-2">Hora Salida</th>
            <th className="border p-2">Costo</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="border">
              <td className="border p-2">{reservation.Parking.name}</td>
              <td className="border p-2">{reservation.Vehicle.carPatent}</td>
              <td className="border p-2">{reservation.startTime}</td>
              <td className="border p-2">{reservation.endTime}</td>
              <td className="border p-2">{reservation.totalCost} Bs/h</td>
              <td className="border p-2">building..</td>
              {/* <td>
                {parking.availableSpaces > 0 ? (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setSelectedParking(parking)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-blue-600"
                    >
                      Reservar
                    </button>
                  </div>
                ) : (
                  "No disponible"
                )}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reservation;