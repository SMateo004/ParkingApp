import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="pt-16 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenido a ParkSmart</h1>
      <p className="text-gray-700 mb-6">Gestiona tu estacionamiento de forma fácil y rápida.</p>
    </div>
  );
}

export default Home;