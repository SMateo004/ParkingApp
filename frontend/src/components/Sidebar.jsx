import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, X, Car, 
  CalendarCheck, Home, 
  ParkingCircle,
  FileText, ListChecks 
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { user } = useContext(AuthContext);

  return (
    <div className="relative">
      <button className="p-2 bg-sky-600 text-white rounded-md" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div
        className={`fixed top-18 left-0 h-full bg-sky-700 text-white w-64 p-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-4">
          {user?.role === "cliente" && (
            <>
              <li>
                <Link to="/" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <Home size={18} /> Inicio
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <CalendarCheck size={18} /> Reservas
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <Car size={18} /> Vehículos
                </Link>
              </li>
              <li>
                <Link to="/parkings" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <ParkingCircle size={18} /> Estacionamientos
                </Link>
              </li>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <li>
                <Link to="/admin/reservations" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <ListChecks size={18} /> Reservas
                </Link>
              </li>
              <li>
                <Link to="/admin/reports-reservations" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                  <FileText size={18} /> Reporte Reservas
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;