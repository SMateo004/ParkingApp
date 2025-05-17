import { useState, useEffect, useContext } from "react";
import { getAllVehicles, addVehicle, updateVehicle, deleteVehicle } from "../../services/api";
import { PencilIcon, Plus, TrashIcon } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import VehicleForm from "../../components/Forms/VehicleForm";
import { useConfirm } from "../../context/ConfirmContext";
import { useNotification } from "../../context/NotificationContext";

function Vehicle() {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ carPatent: "", model: "", vehicleType: "" });
  const { showNotification } = useNotification();
  const { showConfirm } = useConfirm();

  const fetchVehicles = async (userId, setVehicles) => {
    if (!userId) return;
    try {
      const data = await getAllVehicles(userId);
      setVehicles(data);
    } catch (error) {
      console.error("Error al obtener vehículos", error);
    }
  };
  
  useEffect(() => {
    fetchVehicles(user?.id, setVehicles);
  }, [user]);
  
  const handleChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateVehicle(newVehicle, newVehicle.id);
        setVehicles((prevData) => 
          prevData.map((item) => (item.id === newVehicle.id ? newVehicle : item))
        );
        showNotification("Vehiculo actualizado correctamente", "success");
      } else {
          await addVehicle(newVehicle);
          setVehicles(await getAllVehicles(user.id));
          showNotification("Vehiculo creado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al añadir vehículo", error);
      showNotification("Error al añadir el vehiculo", "error");
    }

    setNewVehicle({ carPatent: "", model: "", vehicleType: "" });
    setIsModalOpen(false);
  };

  const handleEdit = (vehicle) => {
    setNewVehicle(vehicle);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setNewVehicle({ carPatent: "", model: "", vehicleType: "" });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleRemove = async (vehicle) => {
    showConfirm({
      title: "Eliminar vehículo",
      message: `¿Deseas eliminar el vehículo ${vehicle.carPatent}?`,
      onConfirm: async () => {
        try {
          await deleteVehicle(vehicle.id);
          setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
          showNotification("Vehículo eliminado con éxito", "success");
        } catch (error) {
          console.log(error)
          showNotification("Error al eliminar el vehículo", "error");
        }
      },
      onCancel: () => setIsModalOpen(false)
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    Object.values(vehicle)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-17 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mis Vehículos</h2>
        <button
          className="flex items-center bg-green-700 text-white px-4 py-2 rounded-md"
          onClick={() => handleAdd()}
        >
          <Plus size={20} className="mr-2" /> Añadir Vehículo
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar en la tabla..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md w-full"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2">Número de Placa</th>
              <th className="p-2">Modelo</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 text-center">{vehicle.carPatent}</td>
                <td className="p-2 text-center">{vehicle.model}</td>
                <td className="p-2 text-center">{vehicle.vehicleType}</td>
                <td className="p-2 text-center">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="text-green-500 hover:text-green-700 mr-2"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemove(vehicle)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                </td>
              </tr>
              ))
            ): (
              <tr>
                <td colSpan="8" className="py-4 px-4 text-center text-gray-500">No se encontraron resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <VehicleForm
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            newRow={newVehicle}
            handleChange={handleChange}
            isEditMode={isEditMode ? true : false}
          />
      )}
    </div>
  );
}

export default Vehicle;
