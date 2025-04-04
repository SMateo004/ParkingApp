import express from "express";
import { makeReservation, getReservations } from "../controllers/reservationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, makeReservation);
router.get("/", authenticate, getReservations);

export default router;