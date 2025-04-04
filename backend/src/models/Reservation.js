import { DataTypes } from "sequelize";
import db from "../config/db.js";
import User from "./User.js";
import Vehicle from "./Vehicle.js";
import Parking from "./Parking.js";

const Reservation = db.define("Reservation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

Reservation.belongsTo(User, { foreignKey: "userId" });
Reservation.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Reservation.belongsTo(Parking, { foreignKey: "parkingId" });

export default Reservation;