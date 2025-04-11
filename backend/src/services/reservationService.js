import Reservation from "../models/Reservation.js";
import Parking from "../models/Parking.js";
import Vehicle from "../models/Vehicle.js";
import { Op } from "sequelize";

export const createReservation = async ({ userId, vehicleId, parkingId, startTime, endTime }) => {
  const isAvailable = await checkAvailabilityService(parkingId, startTime, endTime);
  if (!isAvailable) throw new Error("El estacionamiento ya está reservado en ese horario.");

  const vehicles = await getAvailableVehiclesService(userId, startTime, endTime);
  if (!vehicles.some((v) => v.id === vehicleId)) throw new Error("El vehículo ya está reservado en ese horario.");

  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");
  if (parking.availableSpaces <= 0) throw new Error("No hay espacios disponibles");

  const durationInHours = (new Date(endTime) - new Date(startTime)) / 3600000;
  const totalCost = Math.min(durationInHours * parking.rate, 15 * durationInHours);

  const reservation = await Reservation.create({
    userId,
    vehicleId,
    parkingId,
    startTime,
    endTime,
    totalCost,
  });

  parking.availableSpaces -= 1;
  await parking.save();

  return reservation;
};


export const checkAvailabilityService = async (parkingId, startTime, endTime) => {
  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");

  const overlappingReservations = await Reservation.count({
    where: {
      parkingId,
      [Op.or]: [
        {
          startTime: { [Op.between]: [startTime, endTime] },
        },
        {
          endTime: { [Op.between]: [startTime, endTime] },
        },
        {
          [Op.and]: [
            { startTime: { [Op.lte]: startTime } },
            { endTime: { [Op.gte]: endTime } },
          ],
        },
      ],
    },
  });

  return overlappingReservations < parking.availableSpaces;
};

export const getAvailableVehiclesService = async (userId, startTime, endTime) => {
  const allVehicles = await Vehicle.findAll({ where: { userId } });

  const reservedVehicles = await Reservation.findAll({
    attributes: ["vehicleId"],
    where: {
      [Op.or]: [
        { startTime: { [Op.between]: [startTime, endTime] } },
        { endTime: { [Op.between]: [startTime, endTime] } },
        {
          [Op.and]: [
            { startTime: { [Op.lte]: startTime } },
            { endTime: { [Op.gte]: endTime } },
          ],
        },
      ],
    },
  });

  const reservedIds = reservedVehicles.map((res) => res.vehicleId);
  return allVehicles.filter((v) => !reservedIds.includes(v.id));
};

export const getUserReservations = async (userId) => {
  return await Reservation.findAll({ where: { userId }, include: ["Parking", "Vehicle"] });
};