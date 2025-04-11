import express from "express";
import { makeReservation, getReservations, checkAvailability, getAvailableVehiclesAsync } from "../controllers/reservationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, makeReservation);
router.get("/", authenticate, getReservations);
router.get("/check-availability", authenticate, checkAvailability);
router.get("/available-vehicles", authenticate, getAvailableVehiclesAsync);

export default router;