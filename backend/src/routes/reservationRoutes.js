import express from "express";
import { 
    makeReservation, 
    getReservations, 
    checkAvailability, 
    getAvailableVehiclesAsync, 
    getAdminReservations, 
    markEntry, 
    updateReservationEndTime,
    markReservationAsPaid,
    markExit 
} from "../controllers/reservationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, makeReservation);
router.get("/", authenticate, getReservations);
router.get("/check-availability", authenticate, checkAvailability);
router.get("/available-vehicles", authenticate, getAvailableVehiclesAsync);
router.get("/admin", authenticate, getAdminReservations);
router.patch("/mark-entry", authenticate, markEntry);
router.patch("/mark-exit", authenticate, markExit);
router.patch("/update-endtime", authenticate, updateReservationEndTime);
router.patch("/pay", authenticate, markReservationAsPaid);

export default router;