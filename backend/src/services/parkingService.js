import Parking from "../models/Parking.js";

const parkingsData = [
  { name: "Parking Centro", city: "Cochabamba", zone: "Zona QueruQueru", capacity: 50, availableSpaces: 20, rate: 10 },
  { name: "Parking Norte", city: "Cochabamba", zone: "Zona Sarcobamba", capacity: 40, availableSpaces: 15, rate: 9 },
  { name: "Parking Sur", city: "Cochabamba", zone: "Zona Tamborada", capacity: 60, availableSpaces: 30, rate: 6 },
  { name: "Parking Plaza", city: "LaPaz", zone: "Zona Sopocachi", capacity: 45, availableSpaces: 10, rate: 14 },
  { name: "Parking Avenida", city: "LaPaz", zone: "Zona Obrajes", capacity: 55, availableSpaces: 25, rate: 11  },
  { name: "Parking Mall", city: "LaPaz", zone: "Zona Miraflores", capacity: 35, availableSpaces: 5, rate: 12  },
  { name: "Parking Express", city: "SantaCruz", zone: "Zona Plan3Mil", capacity: 70, availableSpaces: 50, rate: 8  },
  { name: "Parking Río", city: "SantaCruz", zone: "Zona Río Pirai", capacity: 50, availableSpaces: 20, rate: 7  },
  { name: "Parking VIP", city: "SantaCruz", zone: "Zona Equipetrol", capacity: 30, availableSpaces: 8, rate: 15  },
];

export const initializeParkings = async () => {
  await Parking.sync({ force: true });
  await Parking.bulkCreate(parkingsData);
};

export const getParkings = async (city, zone) => {
  const filters = {};
  if (city) filters.city = city;
  if (zone) filters.zone = zone;

  return await Parking.findAll({ where: filters });
};
