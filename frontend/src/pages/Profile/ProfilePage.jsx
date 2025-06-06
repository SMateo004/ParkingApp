import { useContext, useEffect, useState } from "react";
import defaultProfile from "../../assets/default-profile.png";
import { getParkings, getUserProfile, setDefaultVehicle } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Car, CircleParking } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function UserProfile() {
  const [userState, setUser] = useState(null);
  const [parking, setParking] = useState(null);
  const [selectedDefaultVehicleId, setSelectedDefaultVehicleId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
  async function loadProfile() {
    try {
      const res = await getUserProfile(user?.id);
      const parkings = await getParkings();
      setUser(res);
      setParking(parkings);

      const vehicles = res.Vehicles || [];
      const defaultVehicle = vehicles.find(v => v.isDefault);

      if (vehicles.length === 1) {
        // Si solo hay un vehículo y no tiene isDefault, marcarlo automáticamente
        const onlyVehicle = vehicles[0];
        setSelectedDefaultVehicleId(onlyVehicle.id);

        if (!onlyVehicle.isDefault) {
          await setDefaultVehicle(onlyVehicle.id);
          showNotification("Vehículo predeterminado asignado automáticamente", "success");
        }
      } else if (defaultVehicle) {
        setSelectedDefaultVehicleId(defaultVehicle.id);
      }

    } catch (err) {
      console.error("Error loading profile", err);
    }
  }

  loadProfile();
}, []);



  const handleVehiculesPage = () => navigate("/vehicles");
  const handleParkingPage = () => navigate("/admin/reservations");

  const handleSaveDefault = async () => {
    if (!selectedDefaultVehicleId) return showNotification("Selecciona un vehículo", "error");
    setSaving(true);
    try {
      await setDefaultVehicle(selectedDefaultVehicleId);
      showNotification("Vehículo predeterminado actualizado", "success");
    } catch {
      showNotification("Error al guardar", "error∫∫");
    } finally {
      setSaving(false);
    }
  };

  if (!userState) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pt-20">
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 md:p-10 text-white flex flex-col md:flex-row items-center">
        <img
          src={defaultProfile}
          alt="User Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 md:mb-0 md:mr-8"
        />
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">{userState.name}</h2>
          <p className="text-gray-300 mb-1"><strong>Email:</strong> {userState.email}</p>
          <p className="text-gray-300 mb-1"><strong>Teléfono:</strong> {userState.phoneNumber}</p>
          <p className="text-gray-300 mb-1"><strong>Ciudad:</strong> {userState.city}</p>
        </div>
      </div>
      {user?.role === "admin" ? (
        <div className="mt-5 bg-gray-800 p-6 rounded-xl shadow text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
            <h3 className="text-xl font-semibold">Estacionamiento</h3>
            <button
              className="flex items-center bg-green-700 text-white px-4 py-2 rounded-md"
              onClick={handleParkingPage}
            >
              <CircleParking size={20} className="mr-2" /> Ir a Reservas
            </button>
          </div>
        
          {parking.length > 0 ? (
            <ul>
              <li key={parking[0].id} className="bg-gray-700 p-4 rounded-md shadow-sm space-y-2">
                <p><strong>Nombre:</strong> {parking[0].name}</p>
                <p><strong>Zona:</strong> {parking[0].zone}</p>
                <p><strong>Capacidad:</strong> {parking[0].capacity}</p>
                <p><strong>Espacios Disponibles:</strong> {parking[0].availableSpaces}</p>
              </li>
            </ul>
            ) : (
              <p className="text-gray-400">No hay Parking registrados.</p>
            )}
        </div>      
      ) : (
        <div className="mt-5 bg-gray-800 p-6 rounded-xl shadow text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
            <h2 className="text-xl font-bold">Mis Vehículos</h2>
            <button
              className="flex items-center bg-green-700 text-white px-4 py-2 rounded-md"
              onClick={handleVehiculesPage}
            >
              <Car size={20} className="mr-2" /> Ir a Vehículos
            </button>
          </div>

          {userState.Vehicles?.length > 0 ? (
            <form className="space-y-4">
              {userState.Vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}   
                  className="bg-gray-700 p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div>
                    <p><strong>Placa:</strong> {vehicle.carPatent}</p>
                    <p><strong>Modelo:</strong> {vehicle.model}</p>
                    <p><strong>Tipo:</strong> {vehicle.vehicleType}</p>
                  </div>
                  <div>
                    <label className="inline-flex items-center mt-2 sm:mt-0">
                    <input
                        type="checkbox"
                        checked={selectedDefaultVehicleId === vehicle.id}
                        onChange={() => setSelectedDefaultVehicleId(vehicle.id)}
                        className="form-checkbox h-5 w-5 text-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-200">Predeterminado</span>
                    </label>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDefault}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar selección"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-400">No hay vehículos registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}