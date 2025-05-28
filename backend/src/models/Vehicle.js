import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Vehicle = db.define("Vehicle", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  carPatent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  vehicleType: {
    type: DataTypes.ENUM("Automovil", "Motocicleta", "Camioneta"),
    allowNull: false,
  },
  isDefault: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default Vehicle;