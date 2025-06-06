// src/routes/reservationRoutes.js

import { Router } from 'express'; // Importa Router desde express
import { authenticate } from '../middlewares/authMiddleware.js'; // Importa el middleware de autenticación
import * as reservationController from '../controllers/reservationController.js'; 

const router = Router();

// Rutas de Reservas
router.post("/", authenticate, reservationController.makeReservation);
router.get("/", authenticate, reservationController.getReservations);
router.get("/check-availability", authenticate, reservationController.checkAvailability);
router.get("/available-vehicles", authenticate, reservationController.getAvailableVehiclesAsync);
router.get("/admin", authenticate, reservationController.getAdminReservations);

// Rutas de Entrada/Salida
// Estas rutas ahora comienzan con "/" para ser relativas al prefijo "/api/reservations"
router.patch("/mark-entry", authenticate, reservationController.markEntry);
router.patch("/mark-exit", authenticate, reservationController.markExit); // <-- ¡CORRECCIÓN CLAVE AQUÍ!

// Rutas de Actualización y Pagos
router.patch("/update-endtime", authenticate, reservationController.updateReservationEndTime);
router.patch("/:id/pay", authenticate, reservationController.processPayment); // Pago principal
router.patch("/:reservationId/pay-extra", authenticate, reservationController.processExtraPayment); // Pago extra

// Rutas de Entrada/Salida por Patente
router.patch("/mark-entry-patent", authenticate, reservationController.markEntryWithPatent);
router.patch("/mark-exit-patent", authenticate, reservationController.markExitWithPatent);

// Rutas de Cancelación y Historial
router.delete("/cancel", authenticate, reservationController.cancelReservation);
router.get('/history', authenticate, reservationController.getHistoricalReservations);


export default router;