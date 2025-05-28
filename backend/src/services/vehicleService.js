import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vehicle from "../models/Vehicle.js";
import dotenv from "dotenv";

dotenv.config();

export const addVehicle = async ({ carPatent, model, vehicleType, userId }) => {
    const existingVehicle = await findVehicleByPatentUserId(carPatent, userId);

    if (existingVehicle) throw new Error("Este vehiculo ya existe");
    
    const newVehicle = await Vehicle.create({
      carPatent,
      model,
      vehicleType,
      userId
    });
  
    return { message: "Vehiculo registrado exitosamente", vehicle: newVehicle };
  };
  
  export const getVehicles = async (userId) => {
    const vehicles = await Vehicle.findAll({ where: { userId } });

    return vehicles;
  };

  export const updateVehicle = async (vehicleId, userId, data) => {
    const existingVehicle = await findVehicleByVehicleIdUserId(vehicleId, userId);
    if (!existingVehicle) {
      throw new Error("Vehículo no encontrado o no autorizado para modificar.");
    }
  
    await existingVehicle.update(data);
    return existingVehicle;
  };

  export const deleteVehicle = async (vehicleId, userId) => {
      const existingVehicle = await findVehicleByVehicleIdUserId(vehicleId, userId);
  
      if (!existingVehicle) {
        throw new Error("Vehículo no encontrado o no autorizado para eliminar.");
      }
  
      await existingVehicle.destroy();
      return { message: "Vehículo eliminado correctamente." };
  };

  const findVehicleByVehicleIdUserId = async (id, userId) => {
    return await Vehicle.findOne({ where: { id, userId } });
  }

  const findVehicleByPatentUserId = async (carPatent, userId) => {
    return await Vehicle.findOne({ where: { carPatent, userId } });
  }

  export const setDefaultVehicle = async (userId, vehicleId) => {
    await Vehicle.update({ isDefault: false }, { where: { userId } });
    await Vehicle.update({ isDefault: true }, { where: { id: vehicleId, userId } });
  
    return { message: "Vehículo marcado como predeterminado." };
  }