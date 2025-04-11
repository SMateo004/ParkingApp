import { createReservation, getUserReservations, checkAvailabilityService, getAvailableVehiclesService } from "../services/reservationService.js";

export const makeReservation = async (req, res) => {
  try {
    const { vehicleId, parkingId, startTime, endTime } = req.body;
    const userId = req.user.id;
    const reservation = await createReservation({ userId, vehicleId, parkingId, startTime, endTime });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await getUserReservations(userId);
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { parkingId, startTime, endTime } = req.query;
    const isThereAvailability = await checkAvailabilityService(parkingId, startTime, endTime);
    res.status(200).json(isThereAvailability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAvailableVehiclesAsync = async (req, res) => {
  try {
    const { userId, startTime, endTime } = req.query;
    const availableVehicles = await getAvailableVehiclesService(userId, startTime, endTime);
    res.status(200).json(availableVehicles);
  } catch (error) {
    console.error("Error obteniendo vehículos disponibles:", error);
    res.status(500).json({ message: error });
  }
};