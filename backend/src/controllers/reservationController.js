// src/controllers/reservationController.js

// --- ¡ÚNICA IMPORTACIÓN DEL SERVICIO! ---
// Esta línea importa TODAS las funciones exportadas de 'reservationService.js'
// y las agrupa bajo un objeto llamado 'reservationService'.
// Por ejemplo: reservationService.createReservation, reservationService.markReservationAsPaidService
import * as reservationService from '../services/reservationService.js';

// NOTA: 'Reservation' solo es necesario si se usa directamente en este archivo.
// Si no lo usas en el controlador (solo en los servicios), puedes eliminar esta línea.
import Reservation from '../models/Reservation.js';



export const makeReservation = async (req, res) => {
  try {
    const { parkingId, startTime, endTime } = req.body;
    const userId = req.user.id;
    // Llama al servicio a través del objeto 'reservationService'
    const reservation = await reservationService.createReservation({ userId, parkingId, startTime, endTime });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getHistoricalReservations = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Controller getHistoricalReservations: req.user o req.user.id no definidos.");
      return res.status(400).json({ message: "ID de usuario no disponible en el token." });
    }
    const userId = req.user.id;
    console.log("Controller getHistoricalReservations: Intentando obtener historial para userId:", userId);
    // Llama al servicio a través del objeto 'reservationService'
    const historicalReservations = await reservationService.getCompletedUserReservations(userId);
    console.log("Controller getHistoricalReservations: Número de reservas históricas encontradas:", historicalReservations.length);
    res.status(200).json(historicalReservations);
  } catch (error) {
    console.error("Controller getHistoricalReservations: Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const processPayment = async (req, res) => {
  // Asegúrate de que el nombre del parámetro en la URL de tu ruta coincida.
  const { id: reservationId } = req.params; // Asumiendo que la ruta usa ':id'

  console.log(`Backend Controller (processPayment): Recibido ID de URL para pago: ${reservationId}`);

  // --- LÍNEAS DE DEPURACIÓN (Mantenidas para verificación inicial) ---
  console.log('Backend Controller: Tipo de reservationService:', typeof reservationService);
  console.log('Backend Controller: ¿markReservationAsPaidService es una propiedad de reservationService?', Object.prototype.hasOwnProperty.call(reservationService, 'markReservationAsPaidService'));
  console.log('Backend Controller: ¿markReservationAsPaidService es una función?', typeof reservationService.markReservationAsPaidService === 'function');
  // --- FIN LÍNEAS DE DEPURACIÓN ---

  try {
    // Llama al servicio a través del objeto 'reservationService'
    const updatedReservation = await reservationService.markReservationAsPaidService(reservationId);

    console.log(`Backend Controller (processPayment): Pago registrado con éxito para reserva: ${updatedReservation.id}`);
    res.status(200).json({
      message: "Pago registrado con éxito",
      reservation: updatedReservation
    });
  } catch (error) {
    console.error("Error en processPayment (controller):", error.message);
    if (error.message === "Reserva no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Esta reserva ya está pagada") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno del servidor al procesar el pago." });
  }
};

export const processExtraPayment = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { amount } = req.body;

    if (typeof amount === 'undefined' || amount === null || amount < 0) {
      return res.status(400).json({ message: "Monto de pago extra inválido." });
    }

    // Llama al servicio a través del objeto 'reservationService'
    const updatedReservation = await reservationService.processExtraPaymentService(reservationId, amount, req.user.id);
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Error al procesar pago extra:", error);
    res.status(500).json({ message: error.message || "Error al procesar pago extra." });
  }
};

export const markReservationAsExited = async (req, res) => {
  try {
    const { reservationId } = req.params;
    // Llama al servicio a través del objeto 'reservationService'
    const updatedReservation = await reservationService.markReservationAsExitedService(reservationId);
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Error al marcar la salida:", error);
    res.status(500).json({ message: error.message || "Error al marcar la salida." });
  }
};

export const getReservations = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Controller getReservations: req.user o req.user.id no definidos.");
      return res.status(401).json({ message: "No autorizado: ID de usuario no disponible en el token." });
    }
    const userId = req.user.id;
    console.log("Controller getReservations: Intentando obtener reservas para userId:", userId);

    // Llama al servicio a través del objeto 'reservationService'
    const reservations = await reservationService.getUserReservations(userId);

    console.log("Controller getReservations: Datos recibidos del servicio:", reservations);
    console.log("Controller getReservations: ¿'reservations' es un arreglo?", Array.isArray(reservations));
    console.log("Controller getReservations: Número de reservas encontradas (usuario):", reservations ? reservations.length : 0);

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error en Controller getReservations:", error.message);
    res.status(500).json({ message: error.message || "Error interno del servidor al obtener reservas." });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { parkingId, startTime, endTime } = req.query;
    // Llama al servicio a través del objeto 'reservationService'
    const isThereAvailability = await reservationService.checkAvailabilityService(parkingId, startTime, endTime);
    res.status(200).json(isThereAvailability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAvailableVehiclesAsync = async (req, res) => {
  try {
    const { userId, startTime, endTime } = req.query;
    // Llama al servicio a través del objeto 'reservationService'
    const availableVehicles = await reservationService.getAvailableVehiclesService(userId, startTime, endTime);
    res.status(200).json(availableVehicles);
  } catch (error) {
    console.error("Error obteniendo vehículos disponibles:", error);
    res.status(500).json({ message: error });
  }
};

export const getAdminReservations = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Controller getAdminReservations: req.user o req.user.id no definidos.");
      return res.status(400).json({ message: "ID de administrador no disponible en el token." });
    }
    const adminId = req.user.id;
    console.log("Controller getAdminReservations: Intentando obtener reservas de admin para adminId:", adminId);
    // Llama al servicio a través del objeto 'reservationService'
    const reservas = await reservationService.getReservationsByAdminService(adminId);
    console.log("Controller getAdminReservations: Número de reservas encontradas (admin):", reservas.length);
    res.json(reservas);
  } catch (error) {
    console.error("Controller getAdminReservations: Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const markEntry = async (req, res) => {
  try {
    const { reservationId } = req.query;
    // Llama al servicio a través del objeto 'reservationService'
    const reserva = await reservationService.markEntryService(reservationId);
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markExit = async (req, res) => {
  try {
    // ¡CAMBIO CLAVE AQUÍ! Obtener reservationId y parkingId de req.query
    const { reservationId, parkingId } = req.query; 

    // Opcional: Validación para asegurarse de que los parámetros existen
    if (!reservationId || !parkingId) {
      console.error("Error: reservationId o parkingId no recibidos en req.query para markExit.");
      return res.status(400).json({ message: "reservationId y parkingId son requeridos para marcar salida." });
    }

    // Pasar ambos IDs al servicio
    const reserva = await reservationService.markExitService(reservationId, parkingId); 
    
    res.json(reserva);
  } catch (error) {
    console.error("Error al marcar salida en controlador:", error); // Log para depuración
    res.status(500).json({ message: error.message || "Error interno del servidor al marcar salida." });
  }
};
export const updateReservationEndTime = async (req, res) => {
  try {
    const { reservationId } = req.query;
    const { newEndTime } = req.body;
    // Llama al servicio a través del objeto 'reservationService'
    const updated = await reservationService.updateReservationEndTimeService(reservationId, newEndTime);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Este controlador 'markReservationAsPaid' es un duplicado si 'processPayment' ya maneja el pago.
// Considera eliminarlo si no se usa en otra ruta.
export const markReservationAsPaid = async (req, res) => {
  try {
    const { reservationId } = req.query;
    // Llama al servicio a través del objeto 'reservationService'
    const updated = await reservationService.markReservationAsPaidService(reservationId);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.query;
    const userId = req.user.id;
    // Llama al servicio a través del objeto 'reservationService'
    const response = await reservationService.cancelReservationService(reservationId, userId);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export async function markEntryWithPatent(req, res) {
  try {
    const { patentNumber } = req.query;
    const adminUserId = req.user.id;
    // Llama al servicio a través del objeto 'reservationService'
    const reservation = await reservationService.markEntryWithPatentService(adminUserId, patentNumber);
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function markExitWithPatent(req, res) {
  try {
    const { patentNumber } = req.query;
    const adminUserId = req.user.id;
    // Llama al servicio a través del objeto 'reservationService'
    const reservation = await reservationService.markExitWithPatentService(adminUserId, patentNumber);
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}