import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      setToken(response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <img src="/logo.png" className="w-30 mb-4">
      </img>
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
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

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">
          Iniciar Sesión
        </button>

        <p className="text-sm mt-4">
          ¿No tienes cuenta? <Link to="/register" className="text-blue-500">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;