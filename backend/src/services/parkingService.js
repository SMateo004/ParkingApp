import Parking from "../models/Parking.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createAdminUsers = async () => {
  const hashedPassword = await bcrypt.hash("Admin2025_", 10);

  const admins = await Promise.all(
    Array.from({ length: 9 }).map((_, i) =>
      User.create({
        name: `Admin ${i + 1}`,
        email: `admin${i + 1}@parking.com`,
        password: hashedPassword,
        role: "admin",
      })
    )
  );

  return admins;
};

export const initializeParkings = async () => {
  await Parking.sync({ force: true });
  await User.sync();
  const admins = await createAdminUsers();

  const parkingsData = [
    { name: "Parking Centro", city: "Cochabamba", zone: "Zona QueruQueru", capacity: 50, availableSpaces: 50, rate: 10, adminId: admins[0].id },
    { name: "Parking Norte", city: "Cochabamba", zone: "Zona Sarcobamba", capacity: 40, availableSpaces: 40, rate: 9, adminId: admins[1].id },
    { name: "Parking Sur", city: "Cochabamba", zone: "Zona Tamborada", capacity: 60, availableSpaces: 60, rate: 6, adminId: admins[2].id },
    { name: "Parking Plaza", city: "LaPaz", zone: "Zona Sopocachi", capacity: 45, availableSpaces: 45, rate: 14, adminId: admins[3].id },
    { name: "Parking Avenida", city: "LaPaz", zone: "Zona Obrajes", capacity: 55, availableSpaces: 55, rate: 11, adminId: admins[4].id },
    { name: "Parking Mall", city: "LaPaz", zone: "Zona Miraflores", capacity: 35, availableSpaces: 35, rate: 12, adminId: admins[5].id },
    { name: "Parking Express", city: "SantaCruz", zone: "Zona Plan3Mil", capacity: 70, availableSpaces: 70, rate: 8, adminId: admins[6].id },
    { name: "Parking Río", city: "SantaCruz", zone: "Zona Río Pirai", capacity: 50, availableSpaces: 50, rate: 7, adminId: admins[7].id },
    { name: "Parking VIP", city: "SantaCruz", zone: "Zona Equipetrol", capacity: 30, availableSpaces: 30, rate: 15, adminId: admins[8].id },
  ];

  await Parking.bulkCreate(parkingsData);
};

export const getParkings = async (city, zone, userId) => {
  const user = await User.findOne({where: { id: userId }})
  const filters = {};
  if (city) {
    filters.city = city;
  } else if (user.role != "admin") {
    filters.city = user.city;
  } else { filters.adminId = userId }
  if (zone) filters.zone = zone;

  return await Parking.findAll({ where: filters });
};
