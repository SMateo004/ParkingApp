import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { registerVehicle, getAllVehicles, updateVehicleController, deleteVehicleController } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/", authenticate, registerVehicle);
router.get("/", authenticate, getAllVehicles);
router.patch("/", authenticate, updateVehicleController);
router.delete("/", authenticate, deleteVehicleController);

export default router;