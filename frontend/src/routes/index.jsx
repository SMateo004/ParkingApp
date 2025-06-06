import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Navbar from "../components/Navbar";
import Vehicle from "../pages/Vehicle/Vehicle"
import Parking from "../pages/Parking/Parking";
import Reservation from "../pages/Reservation/Reservation";
import AdminReservationPage from "../pages/Reservation/AdminReservation";
import ReservationReports from "../pages/Reports/ReservationReport";
import MarkEntryPage from "../pages/EntriesAndExits/Entry&Exits";
import UserProfile from "../pages/Profile/ProfilePage";
import ReservationHistory from "../pages/Reservation/ReservationHistory";


function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user?.role === "admin" ? children : <Navigate to="/" />;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={user?.role === "admin" ? <PrivateRoute><AdminRoute><AdminReservationPage /></AdminRoute></PrivateRoute> : <PrivateRoute><Parking /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<PrivateRoute><Vehicle/></PrivateRoute>} />
        <Route path="/parkings" element={<PrivateRoute><Parking /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><Reservation /></PrivateRoute>} />
        <Route path="/admin/reservations" element={<PrivateRoute><AdminRoute><AdminReservationPage /></AdminRoute></PrivateRoute>} />
        <Route path="/admin/reports-reservations" element={<PrivateRoute><AdminRoute><ReservationReports /></AdminRoute></PrivateRoute>} />
        <Route path="/admin/check" element={<PrivateRoute><AdminRoute><MarkEntryPage /></AdminRoute></PrivateRoute>} />
        <Route path="/reservations/history" element={<PrivateRoute><ReservationHistory /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default AppRoutes;