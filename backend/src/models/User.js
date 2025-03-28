import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Vehicle from "./Vehicle.js";


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
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "cliente"),
    defaultValue: "cliente",
  },
});

User.hasMany(Vehicle, { foreignKey: "userId", onDelete: "CASCADE" });
Vehicle.belongsTo(User, { foreignKey: "userId" });

export default User;