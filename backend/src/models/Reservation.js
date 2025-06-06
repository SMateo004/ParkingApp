// src/models/Reservation.js
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
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  extraCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  paidExtra: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'userId',
  },
});

export default Reservation;