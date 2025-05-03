import { useState, useContext } from "react";
import { downloadReservationsReport } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const ReservationReports = () => {
  const { token } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      showNotification("Selecciona un rango de fechas", "error");
      return;
    }
    try {
      await downloadReservationsReport(startDate, endDate, token);
      showNotification("Reporte descargado exitosamente", "success");
    } catch (error) {
      console.error(error);
      showNotification("Error al generar reporte", "error");
    }
  };

  return (
    <div className="container mx-auto mt-20 p-4">
      <h1 className="text-2xl font-bold mb-6">Generar Reporte de Reservas</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Generar Reporte PDF
        </button>
      </div>
    </div>
  );
};

export default ReservationReports;