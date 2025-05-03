import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { initializeParkings } from "./services/parkingService.js";

import db from "./config/db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/parkings", parkingRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reports", reportRoutes);

db.authenticate()
  .then(async () => {
    console.log("Conectado a PostgreSQL")
    //await initializeParkings();
  })
  .catch((err) => console.error("Error al conectar la BD:", err));

db.sync({ alter: false })
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.log("Error al conectar la BD", err));

export default app;