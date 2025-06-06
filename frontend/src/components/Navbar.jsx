import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  ChevronDown,
  LogOut,
  User,
  FileText,
  ScanLine,
} from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname === "/login" || location.pathname === "/register") return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-sky-700 text-white p-4 flex justify-between items-center shadow-md z-50">
      {/* NAVBAR PARA CLIENTE */}
      {user?.role === "cliente" && (
        <div className="flex items-center gap-4">
          <Link to="/parkings">
            <h1 className="text-xl font-bold cursor-pointer">ParkSmart</h1>
          </Link>
          <Link to="/reservations" className="hover:text-blue-300">
            <CalendarCheck size={22} />
          </Link>
        </div>
      )}

      {/* NAVBAR PARA ADMIN */}
      {user?.role === "admin" && (
        <div className="flex items-center gap-4">
          <Link to="/admin/reservations">
            <h1 className="text-xl font-bold cursor-pointer">ParkSmart</h1>
          </Link>
          <div className="flex gap-3">
            <Link to="/admin/reports-reservations" className="hover:text-blue-300">
              <FileText size={20} />
            </Link>
            <Link to="/admin/check" className="hover:text-blue-300">
              <ScanLine size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* MENÚ USUARIO */}
      {user ? (
        <div className="relative">
          {/* VISTA PARA ESCRITORIO */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-blue-400"
            >
              <User className="w-5 h-5" />
              {user.name || "Usuario"}
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 text-white"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* VISTA PARA MÓVIL */}
          <div className="sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center">
              <ChevronDown size={24} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-black hover:text-blue-400"
                >
                  <User className="w-5 h-5" />
                  {user.name || "Usuario"}
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-gray-200"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link to="/login" className="bg-gray-200 text-black px-3 py-1 rounded-md">
          Iniciar Sesión
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
