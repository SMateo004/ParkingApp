import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define("Vehicle", {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default User;