import { generateReservationsReportService } from "../services/reportService.js";

export const generateReservationsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const adminId = req.user.id;

    const pdfData = await generateReservationsReportService(adminId, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_reservas.pdf');
    res.send(pdfData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};