import Parking from "../models/Parking.js";
import Vehicle from "../models/Vehicle.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { Op } from "sequelize";

export const createReservation = async ({ userId, vehicleId, parkingId, startTime, endTime }) => {
  const isAvailable = await checkAvailabilityService(parkingId, startTime, endTime);
  if (!isAvailable) throw new Error("El estacionamiento ya está reservado en ese horario.");

  const vehicles = await getAvailableVehiclesService(userId, startTime, endTime);
  if (!vehicles.some((v) => v.id === vehicleId)) throw new Error("El vehículo ya está reservado en ese horario.");

  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");
  if (parking.availableSpaces <= 0) throw new Error("No hay espacios disponibles");

  const durationInHours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const totalCost = Math.ceil(durationInHours) * parking.rate;

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
  return await Reservation.findAll({ where: { userId }, include: [Parking, Vehicle]});
};

export const getReservationsByAdminService = async (adminId) => {
  const parking = await Parking.findOne({ where: { adminId } });
  console.log(parking)
  if (!parking) throw new Error("No se encontró un estacionamiento para este admin");

  return await Reservation.findAll({
    where: { parkingId: parking.id },
    include: [Vehicle, User, Parking],
  });
};

export const markEntryService = async (reservationId) => {
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) throw new Error("Reserva no encontrada");
  reservation.entryTime = new Date();
  await reservation.save();
  return reservation;
};

export const updateReservationEndTimeService = async (reservationId, newEndTime) => {
  const reservation = await Reservation.findByPk(reservationId, {
    include: [Parking, Vehicle]
  });

  if (!reservation) throw new Error("Reserva no encontrada");

  const oldEnd = new Date(reservation.endTime);
  const newEnd = new Date(newEndTime);

  if (newEnd <= oldEnd) throw new Error("La nueva hora de salida debe ser mayor a la actual");

  const sameDay =
    oldEnd.getFullYear() === newEnd.getFullYear() &&
    oldEnd.getMonth() === newEnd.getMonth() &&
    oldEnd.getDate() === newEnd.getDate();

  if (!sameDay) throw new Error("La nueva hora debe ser en el mismo día que la reserva original");

  const hours = (newEnd - new Date(reservation.startTime)) / (1000 * 60 * 60);
  const cost = Math.ceil(hours) * reservation.Parking.rate;

  reservation.endTime = newEnd;
  reservation.totalCost = cost;
  await reservation.save();
  return reservation;
};