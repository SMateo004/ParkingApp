import app from "./src/app.js";
import db from "./src/config/db.js";
import "./src/models/User.js";
import "./src/models/Parking.js";
import "./src/models/Reservation.js";
import "./src/models/Vehicle.js";
import "./src/utils/associations.js";
import { initializeParkings } from "./src/services/parkingService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✅ Conectado a PostgreSQL");

    await db.sync({ alter: true }); // o { alter: true } en producción
    console.log("✅ Base de datos sincronizada");

    await initializeParkings(); // Ya no hace syncs internos
    console.log("✅ Datos iniciales insertados");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar la aplicación:", error);
  }
};

startServer();