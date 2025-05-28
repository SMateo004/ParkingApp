import { addVehicle, getVehicles, updateVehicle, deleteVehicle, setDefaultVehicle } from "../services/vehicleService.js";

export const registerVehicle = async (req, res) => {
  try {
    const { carPatent, model, vehicleType, phoneNumber } = req.body
    const userId = req.user.id;

    const response = await addVehicle({ carPatent, model, vehicleType, phoneNumber, userId });
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "El userId es requerido" });
      }
      
      const response = await getVehicles(userId)
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export const updateVehicleController = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const userId = req.user.id;

    const updatedVehicle = await updateVehicle(vehicleId, userId, req.body);

    res.status(200).json({ message: "Vehículo actualizado correctamente", vehicle: updatedVehicle });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVehicleController = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const userId = req.user.id;
    const response = await deleteVehicle(vehicleId, userId);

    res.status(200).json({ message: response.message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const setDefaultVehicleController = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const userId = req.user.id;
    const response = await setDefaultVehicle(userId, vehicleId);

    res.status(200).json({ message: response.message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};