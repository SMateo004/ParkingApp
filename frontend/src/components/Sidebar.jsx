import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { user } = useContext(AuthContext);

  return (
    <div className="relative">
      <button className="p-2 bg-blue-600 text-white rounded-md" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div
        className={`fixed top-18 left-0 h-full bg-gray-800 text-white w-64 p-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-4">
          {user?.role === "cliente" && (
            <>
              <li>
                <Link to="/" className="block p-2 hover:bg-gray-700 rounded-md">Inicio</Link>
              </li>
              {/* <li>
                <Link to="/profile" className="block p-2 hover:bg-gray-700 rounded-md">Perfil</Link>
              </li> */}
              <li>
                <Link to="/reservations" className="block p-2 hover:bg-gray-700 rounded-md">Reservas</Link>
              </li>
              <li>
                <Link to="/vehicles" className="block p-2 hover:bg-gray-700 rounded-md">Vehiculos</Link>
              </li>
              <li>
                <Link to="/parkings" className="block p-2 hover:bg-gray-700 rounded-md">Estacionamientos</Link>
              </li>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <li><Link to="/admin/reservations" className="block p-2 hover:bg-gray-700 rounded-md">Reservas</Link></li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;