import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getAllVehicles = async (userId) => {
  const response = await api.get("/vehicles", { params: { userId } });
  return response.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await api.post("/vehicles", vehicleData);
  return response.data;
};

export const updateVehicle = async (vehicleUpdatedData, vehicleId) => {
  const response = await api.patch("/vehicles", vehicleUpdatedData, { params: { vehicleId } });
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await api.delete("/vehicles", { params: { vehicleId } });
  return response.data;
};

export const getParkings = async (city, zone) => {
  const params = {};
  if (city) params.city = city;
  if (zone) params.zone = zone;

  const response = await api.get("/parkings", { params });
  return response.data;
};

export const createReservation = async (reservationData) => {
  const response = await api.post("/reservations", reservationData);
  return response.data;
};

export const getReservations = async () => {
  const response = await api.get("/reservations");
  return response.data;
};

export default api;