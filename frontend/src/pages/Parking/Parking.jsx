import { useState, useEffect, useContext } from "react";
import {
  getParkings,
  getUserProfile,
  setDefaultVehicle,
  getUserReservations,
  cancelReservation,
} from "../../services/api";
import ReservationForm from "../../components/Forms/ReservationForm";
import UpdateReservationForm from "../../components/Forms/UpdateReservationForm";
import PaymentModal from "../Payment/Payment";
import { AuthContext } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useNotification } from "../../context/NotificationContext";
import {
  CarFront,
  CheckCircle,
  Clock,
  Car,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const zones = {
  Cochabamba: ["Zona QueruQueru", "Zona Sarcobamba", "Zona Tamborada"],
  LaPaz: ["Zona Sopocachi", "Zona Obrajes", "Zona Miraflores"],
  SantaCruz: ["Zona Plan3Mil", "Zona Río Pirai", "Zona Equipetrol"],
};

const Parking = () => {
  const { user } = useContext(AuthContext);
  const { showConfirm } = useConfirm();
  const { showNotification } = useNotification();
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setDefaultVehicleIfOnlyOne = async () => {
      try {
        const profile = await getUserProfile(user?.id);
        const vehicles = profile.Vehicles || [];
        const defaultVehicle = vehicles.find((v) => v.isDefault);

        if (user?.role === "cliente" && vehicles.length === 1 && !defaultVehicle) {
          await setDefaultVehicle(vehicles[0].id);
        }
      } catch (error) {
        setError("Error al cargar el perfil de usuario");
      }
    };
    setDefaultVehicleIfOnlyOne();
  }, [user]);

  useEffect(() => {
    const loadCityAndParkings = async () => {
      try {
        const profile = await getUserProfile(user?.id);
        const userCity = profile.city;
        setCity(userCity);
        const data = await getParkings(userCity, zone);
        setParkings(data);
      } catch (error) {
        setError("Error al cargar estacionamientos");
      }
    };
    loadCityAndParkings();
  }, [user, zone]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const data = await getUserReservations();
        setReservations(data || []);
        setIsLoading(false);
      } catch (error) {
        setError("Error al cargar reservas");
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleViewDetails = () => navigate("/reservations");
  const filteredReservation = reservations.find(r => !r.exitTime);

  return (
    <div className="container mx-auto p-4 mt-20">
      <h1 className="text-3xl font-bold mb-8 text-sky-800 flex items-center gap-3">
        <CarFront className="h-8 w-8 text-sky-600" /> Estacionamientos Disponibles
      </h1>

      {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
      {isLoading && <div className="mb-4 text-gray-500 text-center">Cargando datos...</div>}

      {city && (
        <div className="mb-6">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="p-3 border rounded-md w-full md:w-64 shadow-sm"
          >
            <option value="">Zona</option>
            {zones[city]?.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkings.map((parking) => {
          const randomStart = Math.floor(Math.random() * 4) + 6;
          const randomEnd = Math.floor(Math.random() * 4) + 18;
          const stars = Math.floor(Math.random() * 5) + 1;

          return (
            <div
              key={parking.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between transition-transform hover:scale-[1.01]"
            >
              <div>
                <h2 className="text-xl font-semibold text-sky-800 mb-2">{parking.name}</h2>
                <p className="text-sm text-gray-600">{parking.zone}</p>
                <p className="text-sm text-gray-600 font-medium mt-1">Horario: {randomStart}:00 - {randomEnd}:00</p>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < stars ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.182 3.643a1 1 0 00.95.69h3.862c.969 0 1.371 1.24.588 1.81l-3.124 2.27a1 1 0 00-.364 1.118l1.182 3.643c.3.921-.755 1.688-1.54 1.118l-3.124-2.27a1 1 0 00-1.175 0l-3.124 2.27c-.784.57-1.838-.197-1.539-1.118l1.182-3.643a1 1 0 00-.364-1.118L2.474 9.07c-.783-.57-.38-1.81.588-1.81h3.862a1 1 0 00.95-.69l1.182-3.643z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                {parking.availableSpaces > 0 ? (
                  <button
                    onClick={() => setSelectedParking(parking)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Reservar
                  </button>
                ) : (
                  <p className="text-red-500 font-semibold text-center">No disponible</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredReservation && (
        <div className="bg-white rounded-2xl shadow-md p-6 mt-10 border border-gray-300">
          <h2 className="text-xl font-bold text-sky-700 mb-4 flex items-center gap-2">
            {filteredReservation.paid ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <Clock className="text-yellow-500" />
            )}
            Progreso de tu Reserva
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div><strong>Estacionamiento:</strong> {filteredReservation.Parking?.name || "No disponible"}</div>
            <div><strong>Vehículo:</strong> {filteredReservation.Vehicle?.carPatent || "No disponible"}</div>
            <div><strong>Entrada:</strong> {new Date(filteredReservation.startTime).toLocaleString()}</div>
            <div><strong>Salida:</strong> {filteredReservation.endTime ? new Date(filteredReservation.endTime).toLocaleString() : "No definida"}</div>
            <div><strong>Costo:</strong> {filteredReservation.totalCost} Bs</div>
          </div>

          {/* Barra de progreso */}
          <div className="relative mt-6">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 bg-sky-600 rounded-full transition-all duration-700`}
                style={{ width: filteredReservation.exitTime ? "100%" : filteredReservation.paid ? "66%" : filteredReservation.entryTime ?  "33%" : "1%" }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Entrada</span>
              <span>Pago</span>
              <span>Salida</span>
            </div>
            <div
              className="absolute -top-6 transition-all duration-700"
              style={{
                left: filteredReservation.exitTime
                  ? "calc(100% - 1rem)"
                  : filteredReservation.paid
                  ? "calc(66% - 1rem)"
                  : filteredReservation.entryTime
                  ? "calc(33% - 1rem)"
                  : "calc(1% - 1rem)",
              }}
            >
              <Car className="text-sky-700 w-6 h-6" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleViewDetails}
              className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Ver Reserva
            </button>
          </div>
        </div>
      )}

      {selectedParking && (
        <ReservationForm
          parking={selectedParking}
          onClose={() => setSelectedParking(null)}
          onReservationSuccess={() => {}}
        />
      )}

      {editReservation && (
        <UpdateReservationForm
          reservation={editReservation}
          onClose={() => setEditReservation(null)}
          onUpdate={(updated) => {
            setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          }}
        />
      )}

      {selectedReservation && (
        <PaymentModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onPaymentSuccess={(updated) => {
            setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          }}
        />
      )}
    </div>
  );
};

export default Parking;
