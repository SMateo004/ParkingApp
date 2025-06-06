// src/models/Vehicle.js
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
    unique: true, // Asumo que la patente debe ser única
  },
  
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: false, // unique: false es redundante si no hay restricción
  },
  color: { // <-- ¡Añade esta línea!
    type: DataTypes.STRING,
    allowNull: true, // O false, dependiendo de si el color es obligatorio
  },
  vehicleType: {
    type: DataTypes.ENUM("Automovil", "Motocicleta", "Camioneta"),
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: { // Asegúrate de que esta columna sea la clave foránea a tu tabla de Usuarios
    type: DataTypes.UUID,
    allowNull: false,
  },
});

// Posible asociación si aún no la tienes (ej. un vehículo pertenece a un usuario)
// Vehicle.associate = (models) => {
//     Vehicle.belongsTo(models.User, { foreignKey: 'userId' });
// };

export default Vehicle;