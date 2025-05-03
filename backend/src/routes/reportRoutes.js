import express from "express";
import { generateReservationsReport } from "../controllers/reportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/reservations", authenticate, generateReservationsReport);

export default router;