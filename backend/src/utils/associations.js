import User from "../models/User.js";
import Parking from "../models/Parking.js";
import Reservation from "../models/Reservation.js";
import Vehicle from "../models/Vehicle.js";

User.hasOne(Parking, { foreignKey: "adminId" });
Parking.belongsTo(User, { as: "admin", foreignKey: "adminId" });

User.hasMany(Reservation);
Reservation.belongsTo(User, { foreignKey: "userId" });

Parking.hasMany(Reservation);
Reservation.belongsTo(Parking, { foreignKey: "parkingId" });

Vehicle.hasMany(Reservation);
Reservation.belongsTo(Vehicle, { foreignKey: "vehicleId" });

User.hasMany(Vehicle, { foreignKey: "userId", onDelete: "CASCADE" });
Vehicle.belongsTo(User, { foreignKey: "userId" });
