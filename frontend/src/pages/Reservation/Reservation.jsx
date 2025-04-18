import { useState, useEffect } from "react";
import { getReservations } from "../../services/api";
import UpdateReservationForm from "../../components/Forms/UpdateReservationForm";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);
  const [minDate, setMinDate] = useState(null)

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

  return (
    <div className="container mx-auto p-4 mt-17">
      <h1 className="text-xl font-bold mb-4">Mis Reservas</h1>

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
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="border">
              <td className="border p-2">{reservation.Parking.name}</td>
              <td className="border p-2">{reservation.Vehicle.carPatent}</td>
              <td className="border p-2">{new Date(reservation.startTime).toLocaleString()}</td>
              <td className="border p-2">{new Date(reservation.endTime).toLocaleString()}</td>
              <td className="border p-2">{reservation.totalCost} Bs/h</td>
              <td className="border p-2">
                {minDate < new Date(reservation.endTime) ? ( 
                  <button
                    onClick={() => setEditReservation(reservation)}
                    className="bg-pink-600 text-white px-2 py-1 rounded hover:bg-pink-800"
                  >
                    Editar Salida
                  </button>
                ) : (
                  <button
                    onClick={()=>{}}
                    className="bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-700"
                  >
                    Realizar Pago
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    </div>
  );
};

export default Reservation;