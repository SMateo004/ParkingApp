import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Parking = db.define("Parking", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.ENUM("Cochabamba", "LaPaz", "SantaCruz"),
    allowNull: false,
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  availableSpaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rate: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
});

export default Parking;