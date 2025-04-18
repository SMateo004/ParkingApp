import app from "./src/app.js";
import "./src/models/User.js";
import "./src/models/Parking.js";
import "./src/models/Reservation.js";
import "./src/models/Vehicle.js";
import "./src/utils/associations.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});