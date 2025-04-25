import { 
  createReservation, 
  getUserReservations, 
  checkAvailabilityService, 
  getAvailableVehiclesService,
  getReservationsByAdminService,
  markEntryService,
  updateReservationEndTimeService,
  markReservationAsPaidService,
  markExitService
} from "../services/reservationService.js";

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

export const getAdminReservations = async (req, res) => {
  try {
    const adminId = req.user.id;
    const reservas = await getReservationsByAdminService(adminId);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markEntry = async (req, res) => {
  try {
    const { reservationId } = req.query;
    const reserva = await markEntryService(reservationId);
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markExit = async (req, res) => {
  try {
    const { reservationId, parkingId } = req.query;
    const reserva = await markExitService(reservationId, parkingId);
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReservationEndTime = async (req, res) => {
  try {
    const { reservationId } = req.query;
    const { newEndTime } = req.body;
    const updated = await updateReservationEndTimeService(reservationId, newEndTime);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markReservationAsPaid = async (req, res) => {
  try {
    const { reservationId } = req.query;
    const updated = await markReservationAsPaidService(reservationId);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
