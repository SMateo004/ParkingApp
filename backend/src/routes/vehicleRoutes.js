import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { registerVehicle, getAllVehicles, updateVehicleController, deleteVehicleController, setDefaultVehicleController } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/", authenticate, registerVehicle);
router.get("/", authenticate, getAllVehicles);
router.patch("/", authenticate, updateVehicleController);
router.delete("/", authenticate, deleteVehicleController);
router.put("/set-default", authenticate, setDefaultVehicleController)
export default router;