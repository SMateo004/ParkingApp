// src/models/User.js
import { DataTypes } from "sequelize"; // <-- ¡Asegúrate de que esta línea esté bien!
import db from "../config/db.js";

const User = db.define("User", {
  id: {
    type: DataTypes.UUID, // Correcto
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING, // <-- Asegúrate de que estés usando DataTypes.STRING
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING, // Correcto
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING, // Correcto
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.INTEGER, // Correcto
    allowNull: true,
  },
  city: {
    type: DataTypes.ENUM("SantaCruz", "Cochabamba", "LaPaz"), // Correcto
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "cliente"), // Correcto
    defaultValue: "cliente",
  },
});

export default User;