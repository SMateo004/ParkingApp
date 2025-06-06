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
//getReservationsByAdminService
  parking.availableSpaces -= 1;
  await parking.save();

  return reservation;
};

export const processExtraPaymentService = async (reservationId, amount, userId) => {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new Error('Reserva no encontrada para pago extra.');
    }

    // Asegúrate de que solo el usuario propietario pueda pagar su extra, o el admin
    // (Depende de tu lógica de seguridad si el admin puede forzar el pago sin ser el dueño)
    // if (reservation.userId !== userId) {
    //     throw new Error("No tienes permiso para procesar el pago de esta reserva.");
    // }

    if (!reservation.paid) {
        throw new Error('La reserva principal no ha sido pagada. Realice el pago principal primero.');
    }
    if (reservation.paidExtra) {
        throw new Error('El pago extra de esta reserva ya ha sido realizado.');
    }
    if (amount <= 0) {
        throw new Error('El monto del pago extra debe ser mayor a cero.');
    }

    // Almacena el monto del pago extra y marca como pagado
    reservation.extraCharges = amount;
    reservation.paidExtra = true;
    await reservation.save();
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
    try {
        if (!userId) {
            console.error("getUserReservations service: User ID es nulo o indefinido.");
            throw new Error("User ID is required to fetch user reservations.");
        }

        console.log("getUserReservations service: Buscando reservas para userId:", userId);

        const reservations = await Reservation.findAll({
            where: {
                userId,
                exitTime: null // Esto filtra solo las reservas que NO tienen una hora de salida (reservas activas)
            },
            include: [
                {
                    model: Vehicle,
                    // Eliminado 'brand'
                    attributes: ['id', 'carPatent', 'model', 'color']
                },
                {
                    model: Parking,
                    // Eliminado 'address'
                    attributes: ['id', 'name', 'city', 'zone']
                },
                {
                    model: User,
                    // Eliminado 'lastName'
                    attributes: ['name']
                }
            ],
            order: [['startTime', 'ASC']]
        });

        console.log("getUserReservations service: Resultado de la consulta Sequelize:", reservations);
        console.log("getUserReservations service: Número de reservas encontradas:", reservations.length);

        return reservations;
    } catch (error) {
        console.error("Error in getUserReservations service:", error);
        throw new Error("Failed to fetch user reservations: " + error.message);
    }
};
export const getCompletedUserReservations = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required to fetch historical reservations.");
        }
        const historicalReservations = await Reservation.findAll({
            where: {
                userId: userId,
                // Puedes definir una reserva "completada" de varias maneras:
                // 1. Que tenga una exitTime
                exitTime: { [Op.ne]: null } // Donde Op es de Sequelize.Op, si usas operadores
                // 2. Que su endTime haya pasado y tenga exitTime o no
                // [Op.or]: [
                //     { exitTime: { [Op.ne]: null } },
                //     { endTime: { [Op.lt]: new Date() } }
                // ]
            },
            include: [
                { model: Vehicle, attributes: ['carPatent', 'model'] },
                { model: Parking, attributes: ['name'] }
            ],
            order: [['startTime', 'DESC']] // Las más recientes primero en el historial
        });
        return historicalReservations;
    } catch (error) {
        console.error("Error in getCompletedUserReservations service:", error);
        throw new Error("Failed to fetch historical reservations: " + error.message);
    }
};

//paymentTime
export const getReservationsByAdminService = async (adminId) => {
    try {
        console.log("Service getReservationsByAdminService: Recibido adminId:", adminId);
        const parking = await Parking.findOne({ where: { adminId } });
        if (!parking) {
            console.error("Service getReservationsByAdminService: No se encontró estacionamiento para adminId:", adminId);
            throw new Error("No se encontró un estacionamiento para este admin.");
        }
        console.log("Service getReservationsByAdminService: Estacionamiento encontrado. ID:", parking.id);

        const reservas = await Reservation.findAll({
            where: { parkingId: parking.id },
            include: [
                { model: Vehicle, attributes: ['carPatent'] },
                { model: User, attributes: ['name'] },
                { model: Parking, attributes: ['id', 'name'] } // <-- ¡CAMBIO AQUÍ! AÑADE 'id'
            ],
            attributes: [
                'id', 
                'startTime', 
                'endTime', 
                'totalCost', 
                'entryTime', 
                'exitTime', 
                'paid', 
                'paidAt',
                'paidExtra' // <-- Asegúrate de que 'paidExtra' también se incluya si lo usas en el frontend
            ]
        });

        console.log("Service getReservationsByAdminService: Detalles de reservas recuperadas:");
        reservas.forEach(reserva => {
            console.log(`  Reserva ID: ${reserva.id}, Paid: ${reserva.paid}, paidAt: ${reserva.paidAt}, paidExtra: ${reserva.paidExtra}, Parking ID: ${reserva.Parking?.id}`);
        });

        console.log("Service getReservationsByAdminService: Consulta exitosa. Encontradas", reservas.length, "reservas de admin.");
        return reservas;
    } catch (error) {
        console.error("Service getReservationsByAdminService: Error al consultar reservas de admin:", error);
        throw new Error(`Error al obtener reservas del admin: ${error.message}`);
    }
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

  await freeUpAvailableSpace(parkingId);
  
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
    console.log(`Backend Service (markReservationAsPaidService): Buscando reserva con ID: ${reservationId}`);
    const reservation = await Reservation.findByPk(reservationId, {
        include: [Vehicle, User, Parking],
    });

    if (!reservation) {
        console.warn(`Backend Service: Reserva NO encontrada para ID: ${reservationId}`);
        throw new Error("Reserva no encontrada"); // Este es el error que te aparece
    }

    if (reservation.paid) {
        console.warn(`Backend Service: Reserva ${reservation.id} ya está pagada.`);
        throw new Error("Esta reserva ya está pagada");
    }

    reservation.paid = true;
    reservation.paidAt = new Date();
    await reservation.save();

    console.log(`Backend Service: Reserva ${reservation.id} marcada como pagada con éxito.`);
    return reservation;
};
//paymentTime
const freeUpAvailableSpace = async (parkingId) => {
  const parking = await Parking.findByPk(parkingId);
  if (!parking) throw new Error("Estacionamiento no encontrado");

  parking.availableSpaces += 1;
  await parking.save();
  return parking;
};

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

  const vehicle = await Vehicle.findOne({ where: { carPatent: patentNumber } });
  if (!vehicle) throw new Error('No se encontró ningún vehículo con esa placa.');

  const now = new Date();

  const reservation = await Reservation.findOne({
    where: {
      vehicleId: vehicle.id,
      parkingId: parking.id,
      entryTime: null,
      startTime: { [Op.lte]: now },
      endTime: { [Op.gte]: now },
    },
  });

  if (!reservation) {
    throw new Error('No se encontró una reserva válida para esta placa en este horario.');
  }

  // Marcar entrada
  reservation.entryTime = now;
  await reservation.save();

  // Actualizar espacios disponibles
  parking.availableSpaces = Math.max(0, parking.availableSpaces - 1);
  await parking.save();

  return reservation;
};
export const markReservationAsExitedService = async (reservationId) => {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new Error('Reserva no encontrada.');
    }
    if (reservation.exitTime) {
        throw new Error('La salida de esta reserva ya ha sido marcada.');
    }

    // Lógica para determinar si se debe un pago extra y si ya se realizó
    const now = new Date();
    let requiresExtraPayment = false;
    if (now > reservation.endTime) {
        const extraMinutes = Math.ceil((now.getTime() - reservation.endTime.getTime()) / (1000 * 60));
        if (extraMinutes * 2 > 0) { // Asumiendo 2 Bs por minuto extra
            requiresExtraPayment = true;
        }
    }

    if (!reservation.paid) {
        throw new Error('La reserva no ha sido pagada. No se puede marcar la salida.');
    }

    // Si se requiere pago extra Y no ha sido pagado, impide la salida
    if (requiresExtraPayment && !reservation.paidExtra) {
        throw new Error('Debe procesar el pago extra antes de marcar la salida.');
    }

    reservation.exitTime = now;
    await reservation.save();
    return reservation;
};

export async function markExitWithPatentService(adminUserId, patentNumber) {
  const adminUser = await User.findByPk(adminUserId);
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('Usuario no autorizado');
  }

  const parking = await Parking.findOne({ where: { adminId: adminUserId } });
  if (!parking) throw new Error('No se encontró el estacionamiento para este administrador.');

  const vehicle = await Vehicle.findOne({ where: { carPatent: patentNumber } });
  if (!vehicle) throw new Error('No se encontró ningún vehículo con esa placa.');

  const now = new Date();

  const reservation = await Reservation.findOne({
    where: {
      vehicleId: vehicle.id,
      parkingId: parking.id,
      entryTime: { [Op.ne]: null },
      exitTime: null,
    },
  });

  if (!reservation) {
    throw new Error('No se encontró una reserva válida en curso para esta placa.');
  }

  if (!reservation.paid) {
    throw new Error('No se puede registrar salida: la reserva no ha sido pagada.');
  }

  const paymentTime = new Date(reservation.updatedAt); // Asumimos que updatedAt se actualizó al pagar
  const timeSincePayment = now - paymentTime;
  const fiveMinutes = 5 * 60 * 1000;

  if (timeSincePayment > fiveMinutes) {
    throw new Error('El tiempo permitido para salir ha expirado. Se aplicará una tarifa adicional.');
  }

  reservation.exitTime = now;
  await reservation.save();

  parking.availableSpaces += 1;
  await parking.save();

  return reservation;
}
