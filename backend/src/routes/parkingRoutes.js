import express from "express";
import { fetchParkings } from "../controllers/parkingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, fetchParkings);

export default router;