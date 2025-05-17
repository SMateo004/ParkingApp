import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const images = [
  "/parking1.png",
  "/parking2.jpg",
  "/parking3.jpg",
];

const benefits = [
  "Reserva tu lugar desde cualquier lugar",
  "Evita filas y pagos en efectivo",
  "Monitorea tus reservas y disponibilidad en tiempo real",
];

function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="w-full max-w-5xl mx-auto relative overflow-hidden h-[300px] sm:h-[400px] rounded-lg shadow-lg">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index}`}
            className={`mt-19 absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      <div className="text-center mt-10 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 mb-2">Bienvenido a ParkSmart</h1>
        <p className="text-gray-700 text-lg">Tu solución inteligente para gestionar estacionamientos</p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {benefits.map((text, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-sky-700 mb-2">🚗 {text}</h3>
            <p className="text-gray-600 text-sm">Accede fácilmente desde la app web o móvil.</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-13 mb-5">
        <Link
          to="/parkings"
          className="bg-sky-600 text-white px-6 py-3 rounded-md hover:bg-sky-700 transition"
        >
          Ir a Reservar
        </Link>
      </div>
    </div>
  );
}

export default Home;