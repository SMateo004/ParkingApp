import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import Vehicle from "../models/Vehicle.js";

dotenv.config();

export const register = async ({ name, email, password, phoneNumber, role, city, vehicle}) => {
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) throw new Error("El usuario ya existe");
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        city
      });

      if (vehicle) {
        await Vehicle.create({
          userId: newUser.id,
          carPatent: vehicle.patentNumber,
          model: vehicle.model,
          vehicleType: vehicle.vehicleType,
        });
      }
      return { message: "Usuario registrado exitosamente", user: newUser };
  };
  
  export const login = async ({ email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Usuario no encontrado");
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Credenciales incorrectas");
  
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      return { token, user: { id: user.id, name: user.name, role: user.role } };
  };

export const getUserProfileService = async (userId) => {
  return await User.findOne({where: {id: userId}, include: [Vehicle]});
};