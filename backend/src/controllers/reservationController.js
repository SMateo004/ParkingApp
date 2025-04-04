import { createReservation, getUserReservations } from "../services/reservationService.js";

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