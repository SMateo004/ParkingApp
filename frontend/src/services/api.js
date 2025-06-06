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

export const getUserProfile = async (userId) => {
  const response = await api.get("/auth/profile", { params: { userId } });
  return response.data;
};

// --- FUNCIÓN UNIFICADA PARA OBTENER RESERVAS ACTIVAS DEL USUARIO LOGUEADO ---
// Renombramos 'getUserReservations' a algo más claro si ya tienes 'getReservations'.
// O mejor aún, usa solo 'getUserReservations' y elimina la otra.
// Si tu frontend ya está llamando a 'getReservations()', entonces mantén 'getReservations'
// y elimina 'getUserReservations'. Lo importante es la consistencia.

// Opción 1: Mantener 'getUserReservations' y eliminar la duplicada 'getReservations' de abajo
export const getUserReservations = async () => {
    const response = await api.get('/reservations'); // Esta es la ruta para el usuario logueado
    return response.data;
};

// Opción 2: Si tu frontend YA usa 'getReservations', elimina la de arriba y usa esta:
// export const getReservations = async () => {
//     const response = await api.get("/reservations"); // Esta es la ruta para el usuario logueado
//     return response.data;
// };

// --- RESTO DE TUS FUNCIONES API ---

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

export const getHistoricalReservations = async () => {
  const response = await api.get("/reservations/history");
  return response.data;
};

// --- ESTA ES LA FUNCIÓN QUE PROBABLEMENTE ESTÁS LLAMANDO MAL EN EL FRONTEND ---
export const checkReservationConflict = async (parkingId, startTime, endTime) => {
  const params = {};
  if (parkingId) params.parkingId = parkingId;
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;

  // Esta ruta es para verificar DISPONIBILIDAD, no para obtener las reservas del usuario.
  const response = await api.get("/reservations/check-availability", { params });
  return response.data; // ¡Este es el objeto { hasEndTime: null, ... } que te aparece!
};

export const getAvailableVehicles = async (userId, startTime, endTime) => {
  const params = {};
  if (userId) params.userId = userId;
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;

  const response = await api.get("/reservations/available-vehicles", { params });
  return response.data;
};

export const getAdminReservations = async () => {
  const response = await api.get("/reservations/admin");
  return response.data;
};

export const markReservationEntry = async (reservationId) => {
  const response = await api.patch("/reservations/mark-entry", {}, { params: { reservationId }});
  return response.data;
};

export const markReservationExit = async (reservationId, parkingId) => {
  const response = await api.patch("/reservations/mark-exit", {}, { params: { reservationId, parkingId }});
  return response.data;
};

export const updateReservationEndTime = async (reservationId, newEndTime) => {
  const response = await api.patch("/reservations/update-endtime", { newEndTime }, { params: { reservationId }});
  return response.data;
};

export const markReservationAsPaid = async (reservationId) => {
    const response = await api.patch(`/reservations/${reservationId}/pay`);
    return response.data;
};

export const processExtraPayment = async (reservationId, amount) => {
    const response = await api.patch(`/reservations/${reservationId}/pay-extra`, { amount });
    return response.data;
};

export const markReservationAsExited = async (reservationId) => {
    const response = await api.patch(`/reservations/${reservationId}/exit`);
    return response.data;
}

export const downloadReservationsReport = async (startDate, endDate, token) => {
  const response = await api.get("/reports/reservations", {
    headers: { Authorization: `Bearer ${token}` },
    params: { startDate, endDate },
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = "reporte_reservas.pdf";
  link.click();
};

export const cancelReservation = async (reservationId) => {
  const response = await api.delete("/reservations/cancel", { params: { reservationId }})
  return response.data;
};

export const markReservationEntryWithPatent = async (patentNumber) => {
  const response = await api.patch("/reservations/mark-entry-patent", {}, { params: { patentNumber }});
  return response.data;
};

export const markReservationExitWithPatent = async (patentNumber) => {
  const response = await api.patch("/reservations/mark-exit-patent", {}, { params: { patentNumber }});
  return response.data;
};

export const setDefaultVehicle = async (vehicleId) => {
  const response = await api.put("/vehicles/set-default", {}, { params: { vehicleId }});
  return response.data;
};

export default api;