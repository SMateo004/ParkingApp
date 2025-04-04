import { useState, useEffect } from "react";
import { getParkings } from "../../services/api";
import ReservationForm from "../../components/Forms/ReservationForm";

const cities = ["Cochabamba", "LaPaz", "SantaCruz"];
const zones = {
  Cochabamba: ["Zona QueruQueru", "Zona Sarcobamba", "Zona Tamborada"],
  LaPaz: ["Zona Sopocachi", "Zona Obrajes", "Zona Miraflores"],
  SantaCruz: ["Zona Plan3Mil", "Zona Río Pirai", "Zona Equipetrol"],
};

const Parking = () => {
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getParkings(city, zone);
      setParkings(data);
    };
    fetchData();
  }, [city, zone]);

  const handleReservationSuccess = (parkingId) => {
    setParkings((prev) =>
      prev.map((parking) =>
        parking.id === parkingId ? { ...parking, availableSpaces: parking.availableSpaces - 1 } : parking
      )
    );
    setSelectedParking(null);
  };

  return (
    <div className="container mx-auto p-4 mt-17">
      <h1 className="text-xl font-bold mb-4">Estacionamientos Disponibles</h1>

      <div className="flex gap-4 mb-4">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border rounded">
          <option value="">Seleccionar Ciudad</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={zone} onChange={(e) => setZone(e.target.value)} className="p-2 border rounded" disabled={!city}>
          <option value="">Seleccionar Zona</option>
          {city && zones[city].map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Ciudad</th>
            <th className="border p-2">Zona</th>
            <th className="border p-2">Capacidad</th>
            <th className="border p-2">Espacios Libres</th>
            <th className="border p-2">Tarifa</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {parkings.map((parking) => (
            <tr key={parking.id} className="border">
              <td className="border p-2">{parking.name}</td>
              <td className="border p-2">{parking.city}</td>
              <td className="border p-2">{parking.zone}</td>
              <td className="border p-2">{parking.capacity}</td>
              <td className="border p-2">{parking.availableSpaces}</td>
              <td className="border p-2">{parking.rate} Bs/h</td>
              <td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedParking && 
        <ReservationForm 
          parking={selectedParking} 
          onClose={() => setSelectedParking(null)} 
          onReservationSuccess={handleReservationSuccess}
        />
      }
    </div>
  );
};

export default Parking;