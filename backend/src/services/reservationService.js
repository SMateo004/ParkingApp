import Parking from "../models/Parking.js";
import Vehicle from "../models/Vehicle.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

export const createReservation = async ({ userId, parkingId, startTime, endTime }) => {
  const isAvailable = await checkAvailabilityService(parkingId, startTime, endTime);
  if (!isAvailable) throw new Error("El estacionamiento ya está reservado en ese horario.");

  const defaultVehicle = await Vehicle.findOne({
    where: { userId, isDefault: true }
  });

  if (!defaultVehicle) throw new Error("No hay vehículo predeterminado.");

  const vehicles = await getAvailableVehiclesService(userId, startTime, endTime);
  if (!vehicles.some((v) => v.id === defaultVehicle.id)) throw new Error("El vehículo ya está reservado en ese horario.");

  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");
  if (parking.availableSpaces <= 0) throw new Error("No hay espacios disponibles");

  const durationInHours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const totalCost = Math.ceil(durationInHours) * parking.rate;

  const reservation = await Reservation.create({
    userId,
    vehicleId: defaultVehicle.id,
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
  const allVehicles = await Vehicle.findAll({ where: { userId, isDefault: true } });

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
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  return await Reservation.findAll({ 
    where: { 
      userId, 
      startTime: {
        [Op.between]: [startOfDay, endOfDay]
      }
    }, include: [Parking, Vehicle]});
};

export const getReservationsByAdminService = async (adminId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const parking = await Parking.findOne({ where: { adminId } });
  if (!parking) throw new Error("No se encontró un estacionamiento para este admin");

  return await Reservation.findAll({
    where: { 
      parkingId: parking.id,
      startTime: {
        [Op.between]: [startOfDay, endOfDay]
      }
    },
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

export const markExitService = async (reservationId, parkingId) => {
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) throw new Error("Reserva no encontrada");
  reservation.exitTime = new Date();
  await reservation.save();

  await freeUpAvailableSpace(parkingId)
  
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

export const markReservationAsPaidService = async (reservationId) => {
  const reservation = await Reservation.findByPk(reservationId, {
    include: [Vehicle, User, Parking],
  });
  
  if (!reservation) throw new Error("Reserva no encontrada");

  if (reservation.paid) throw new Error("Esta reserva ya está pagada");

  reservation.paid = true;
  await reservation.save();

  return reservation;
};

const freeUpAvailableSpace = async (parkingId) => {
  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");

  parking.availableSpaces += 1;
  await parking.save();
  return parking;
}

export const cancelReservationService = async (reservationId, userId) => {
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) throw new Error("Reserva no encontrada");
  if (reservation.userId !== userId) throw new Error("No autorizado para cancelar esta reserva");
  if (reservation.paid) throw new Error("No se puede cancelar una reserva ya pagada");

  await reservation.destroy();
  return { message: "Reserva cancelada correctamente" };
};

export async function markEntryWithPatentService(adminUserId, patentNumber) {
  const adminUser = await User.findByPk(adminUserId);
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('Usuario no autorizado');
  }

  const parking = await Parking.findOne({ where: { adminId: adminUserId } });
  if (!parking) throw new Error('No se encontró el estacionamiento para este administrador.');
  if (parking.availableSpaces <= 0) throw new Error('No hay espacios disponibles.');

  let user = await User.findOne({ where: { email: { [Op.iLike]: `%auto@default.com` } } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('temp', 10);
    user = await User.create({
      name: 'Visitante',
      email: `user_${Date.now()}@default.com`,
      password: hashedPassword,
    });
  }

  let vehicle = await Vehicle.findOne({ where: { carPatent: patentNumber } });
  if (!vehicle) {
    vehicle = await Vehicle.create({
      carPatent: patentNumber,
      userId: user.id,
      vehicleType: 'auto',
      model: 'sedan',
      isDefault: true
    });
  }

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 30 * 60000);

  const isAvailable = await checkAvailabilityService(parking.id, startTime, endTime);
  if (!isAvailable) throw new Error("El estacionamiento ya está reservado en ese horario.");

  const vehicles = await getAvailableVehiclesService(user.id, startTime, endTime);
  if (!vehicles.some((v) => v.id === vehicle.id)) throw new Error("El vehículo ya está reservado en ese horario.");

  const durationHours = 0.5;
  const totalCost = Math.ceil(durationHours * parking.rate);

  let reservation = await Reservation.create({
    userId: user.id,
    vehicleId: vehicle.id,
    parkingId: parking.id,
    startTime,
    endTime,
    totalCost,
  });

  parking.availableSpaces -= 1;
  await parking.save();

  const newReservation = await markEntryService(reservation.id)

  return newReservation;
}


export async function markExitWithPatentService(adminUserId, patentNumber) {
  const vehicle = await Vehicle.findOne({ where: { carPatent: patentNumber } });
  if (!vehicle) throw new Error('No se encontró el vehiculo para marcar la salida.');

  const reservation = await Reservation.findOne({ where: {vehicleId: vehicle.id}})
  if (!reservation) throw new Error('No se encontró la reservacion para este vehiculo.');

  const parking = await Parking.findOne({ where: { adminId: adminUserId } });
  if (!parking) throw new Error('No se encontró el estacionamiento para este administrador.');

  return await markExitService(reservation.id, parking.id);
}