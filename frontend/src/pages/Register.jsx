import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [patentNumber, setPatentNumber] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        phoneNumber,
        city,
        role: "cliente",
        vehicle: {
          patentNumber,
          model,
          vehicleType,
        },
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-7">
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Registro</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Información Personal</h3>

            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Correo Electrónico</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Número de Celular</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="12345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Ciudad</label>
              <select
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Seleccionar</option>
                <option value="SantaCruz">Santa Cruz</option>
                <option value="LaPaz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Datos del Vehículo</h3>

            <div>
              <label className="block text-sm mb-1">Número de Placa</label>
              <input
                type="text"
                value={patentNumber}
                onChange={(e) => setPatentNumber(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Modelo / Marca</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Tipo de Vehículo</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Automovil">Automóvil</option>
                <option value="Motocicleta">Motocicleta</option>
                <option value="Camioneta">Camioneta</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2 mt-6 text-center space-y-3">
            <button
              type="submit"
              className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition"
            >
              Registrarse
            </button>
            <p className="text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}