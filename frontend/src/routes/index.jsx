import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Navbar from "../components/Navbar";
import Vehicle from "../pages/Vehicle/Vehicle"
import Parking from "../pages/Parking/Parking";

function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<PrivateRoute><Vehicle/></PrivateRoute>} />
        <Route path="/parkings" element={<PrivateRoute><Parking /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;