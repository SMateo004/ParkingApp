import Reservation from "../models/Reservation.js";
import Parking from "../models/Parking.js";

export const createReservation = async ({ userId, vehicleId, parkingId, startTime, endTime }) => {
  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");

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

export const getUserReservations = async (userId) => {
  return await Reservation.findAll({ where: { userId }, include: ["Parking", "Vehicle"] });
};