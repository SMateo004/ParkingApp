import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import db from "./config/db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

db.authenticate()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((err) => console.error("Error al conectar la BD:", err));

db.sync({ alter: true })
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.log("Error al conectar la BD", err));

export default app;