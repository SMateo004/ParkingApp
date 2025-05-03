import PDFDocument from "pdfkit";
import Reservation from "../models/Reservation.js";
import Parking from "../models/Parking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

export const generateReservationsReportService = async (adminId, startDate, endDate) => {
  const parking = await Parking.findOne({ where: { adminId } });
  if (!parking) throw new Error("No se encontró estacionamiento para este administrador");

  const reservations = await Reservation.findAll({
    where: {
      parkingId: parking.id,
      startTime: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [User, Vehicle, Parking]
  });

  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  const logoPath = path.resolve("assets", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  doc
    .fontSize(20)
    .fillColor("#333")
    .text("Parking App - Reporte de Reservas", 120, 50, { align: "left" })
    .moveDown(2);

  doc
    .fontSize(14)
    .fillColor("#555")
    .text(`Estacionamiento: ${parking.name}`, { align: "left" })
    .text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, { align: "left" })
    .moveDown(1);

    const tableTop = 200;
    const itemSpacing = 30;
    
    doc
      .fontSize(12)
      .fillColor("#000")
      .text("Vehículo", 50, tableTop)
      .text("Usuario", 130, tableTop)
      .text("Inicio", 220, tableTop)
      .text("Fin", 370, tableTop) 
      .text("Total Bs", 510, tableTop)
      .moveTo(50, tableTop + 20)
      .lineTo(560, tableTop + 20)
      .stroke("#000");
    
    let y = tableTop + 30;
    
    reservations.forEach((res, index) => {
      if (y > 730) {
        doc.addPage();
        y = 50;
      }
    
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(res.Vehicle?.carPatent || "Sin dato", 50, y)
        .text(res.User?.name || "Anonimo", 130, y, { width: 80 })
        .text(new Date(res.startTime).toLocaleString(), 220, y, { width: 140 })
        .text(new Date(res.endTime).toLocaleString(), 370, y, { width: 140 })
        .text(res.totalCost + " Bs", 510, y);
    
      y += itemSpacing;
    });
    
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
        .fillColor("gray")
        .text(`Página ${i + 1} de ${range.count}`, 50, 700, { align: "center" });
    }

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);
  });
};