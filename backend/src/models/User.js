import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  city: {
    type: DataTypes.ENUM("SantaCruz", "Cochabamba", "LaPaz"),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "cliente"),
    defaultValue: "cliente",
  },
});

export default User;