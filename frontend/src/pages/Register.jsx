import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", { name, email, password, phoneNumber, role: "cliente" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
        <label className="block mb-2">Nombre</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md mb-4"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2">Correo Electrónico</label>
        <input
          type="email"
          className="w-full p-2 border rounded-md mb-4"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <label className="block mb-2">Contraseña</label>
        <input
          type="password"
          className="w-full p-2 border rounded-md mb-4"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block mb-2">Numero de Celular</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md mb-4"
          placeholder="12345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(parseInt(e.target.value))}
        />


        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md">
          Registrarse
        </button>

        <p className="text-sm mt-4">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-500">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
