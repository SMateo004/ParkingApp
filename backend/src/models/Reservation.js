import { DataTypes } from "sequelize";
import db from "../config/db.js";

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
  entryTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  exitTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

export default Reservation;