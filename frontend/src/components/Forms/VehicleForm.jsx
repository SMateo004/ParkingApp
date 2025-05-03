import React from "react";

const VehicleForm = ({ onSubmit, onCancel, newRow, handleChange, isEditMode }) => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return(
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600/75 bg-opacity-50 z-50">
            <div className="bg-white m-3 p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
                {isEditMode ? "Editar Vehiculo" : "Agregar Vehiculo"}
            </h3>
            <form className="mt-4" onSubmit={handleSubmit }>
                <label className="block mb-2">
                Número de Placa:
                <input
                    type="text"
                    name="carPatent"
                    value={newRow.carPatent || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </label>

                <label className="block mb-2">
                Modelo:
                <input
                    type="text"
                    name="model"
                    value={newRow.model || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </label>

                <label className="block mb-4">
                Tipo de Vehículo:
                <select
                    name="vehicleType"
                    value={newRow.vehicleType || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">Seleccionar</option>
                    <option value="Automovil">Automóvil</option>
                    <option value="Motocicleta">Motocicleta</option>
                    <option value="Camioneta">Camioneta</option>
                </select>
                </label>

                <div className="flex justify-end col-span-3 space-x-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isEditMode ? "Actualizar Cambios" : "Guardar"}
                    </button>
                </div>
            </form>
            </div>
      </div>
    )
}
export default VehicleForm;