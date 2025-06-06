import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserReservations, markReservationAsExited, cancelReservation } from "../../services/api";
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useConfirm } from "../../context/ConfirmContext";
import UpdateReservationForm from "../../components/Forms/UpdateReservationForm";
import PaymentModal from '../../pages/Payment/Payment';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaCalendarAlt, FaMoneyBill, FaUser, FaClock, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';

// --- Inicio del componente AdminReservationCard (definido internamente) ---

const AdminReservationCard = ({
    reservation,
    extraTimeInfo,
    onPaymentClick,
    onExtraPaymentClick,
    onMarkExit
}) => {
    const [editReservation, setEditReservation] = useState(null);
    const { showConfirm } = useConfirm();
    const { showNotification } = useNotification();
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('es-BO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    };

    const now = new Date();
    const endTime = new Date(reservation.endTime);
    const hasExceededTime = now > endTime && reservation.entryTime;
    const isPaid = reservation.paid;
    const isExtraPaid = reservation.paidExtra;
    const hasCalculatedExtraCharges = extraTimeInfo && extraTimeInfo.totalCost > 0 && hasExceededTime;
    const showPayButton = !isPaid && reservation.entryTime;
    const showEditButton = !isPaid;
    const showCancelButton = !isPaid && !reservation.entryTime;
    const showPayExtraButton = isPaid && hasExceededTime && hasCalculatedExtraCharges && !isExtraPaid && reservation.entryTime;

    const canMarkExit = isPaid && (!hasExceededTime || isExtraPaid) && !reservation.exitTime;

    const handleCancelClick = (reservation) => {
        showConfirm({
            title: "Cancelar reserva",
            message: "¿Estás seguro de que deseas cancelar esta reserva?",
            onConfirm: async () => {
                try {
                    await cancelReservation(reservation.id);
                    setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
                    showNotification("Reserva cancelada", "success");
                } catch {
                    showNotification("Error al cancelar reserva", "error");
                }
            },
            onCancel: () => setSelectedReservation(null),
        });
    };

    const handlePayClick = (reservation) => {
        showConfirm({
            title: "¿Deseas pagar la Reserva?",
            message: "No podrás editar la salida después de pagar.",
            onConfirm: async () => {
                try {
                    onPaymentClick(reservation)
                } catch {
                    showNotification("Error al cancelar reserva", "error");
                }
            },
            onCancel: () => setSelectedReservation(null),
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-300 mb-6">
            <div className="flex items-center mb-4">
                <FaCar className="text-blue-600 text-3xl mr-3" />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Reserva en {reservation.Parking?.name}</h3>
                    <p className="text-sm text-gray-500">Vehículo: {reservation.Vehicle?.carPatent}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center"><FaUser className="mr-2" /><span>Usuario: {reservation.User?.name}</span></div>
                <div className="flex items-center"><FaCalendarAlt className="mr-2" /><span>Inicio: {formatDateTime(reservation.startTime)}</span></div>
                <div className="flex items-center"><FaClock className="mr-2" /><span>Fin Programado: {formatDateTime(reservation.endTime)}</span></div>
                <div className="flex items-center"><FaMoneyBill className="mr-2" /><span>Costo Inicial: {reservation.totalCost} Bs</span></div>
                <div className="flex items-center"><FaCheck className="mr-2" /><span>Estado Pago: <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>{isPaid ? 'Pagado' : 'Pendiente'}</span></span></div>

                {reservation.entryTime && (
                    <div className="flex items-center"><FaClock className="mr-2" /><span>Ingreso: {formatDateTime(reservation.entryTime)}</span></div>
                )}
                {reservation.exitTime && (
                    <div className="flex items-center"><FaClock className="mr-2" /><span>Salida: {formatDateTime(reservation.exitTime)}</span></div>
                )}
            </div>

            {hasExceededTime && (
                <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                    <p className="font-semibold mb-1">Tiempo Excedido</p>
                    {extraTimeInfo ? (
                        <>
                            <p>{extraTimeInfo.totalMinutes} minutos extra</p>
                            <p>Costo Extra: {extraTimeInfo.totalCost} Bs</p>
                            <p>Pago Extra: <span className={`font-semibold ${isExtraPaid ? 'text-green-600' : 'text-red-600'}`}>{isExtraPaid ? `Pagado (${reservation.extraCharges} Bs)` : 'Pendiente'}</span></p>
                        </>
                    ) : <p>Calculando costo extra...</p>}
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
                {showPayButton && (
                    <button
                        onClick={() => handlePayClick(reservation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >Pagar</button>
                )}

                {showEditButton && (
                    <button
                        onClick={() => setEditReservation(reservation)}
                        className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                    >Editar Salida</button>
                )}

                {showCancelButton && (
                    <button
                        onClick={() => handleCancelClick(reservation)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >Cancelar</button>
                )}

                {showPayExtraButton && (
                    <button
                        onClick={() => onExtraPaymentClick(reservation)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >Pagar Extra</button>
                )}
            </div>

            {editReservation && (
                <UpdateReservationForm
                    reservation={editReservation}
                    onClose={() => setEditReservation(null)}
                    onUpdate={(updated) => {
                        setReservations((prev) =>
                            prev.map((r) => (r.id === updated.id ? updated : r))
                        );
                    }}
                />
            )}
        </div>
    );
};


// --- Fin del componente AdminReservationCard ---


const Reservations = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate(); // Inicializa useNavigate
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [extraTimeCounters, setExtraTimeCounters] = useState({});
    const intervalRefs = useRef({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUserReservations();
            setReservations(data);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
            showNotification(err.response?.data?.message || 'Error al cargar reservas.', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        Object.values(intervalRefs.current).forEach(clearInterval);
        intervalRefs.current = {};

        reservations.forEach(reservation => {
            const initialEndTime = new Date(reservation.endTime);
            if (!reservation.exitTime && new Date() > initialEndTime) {
                // Si ya excedió el tiempo y el pago extra ya fue realizado,
                // solo mostramos el costo extra ya pagado y no iniciamos el contador
                if (reservation.extraCharges > 0 && reservation.paidExtra) {
                    setExtraTimeCounters(prev => ({
                        ...prev,
                        [reservation.id]: {
                            totalMinutes: Math.ceil((new Date().getTime() - initialEndTime.getTime()) / (1000 * 60)),
                            totalCost: reservation.extraCharges
                        }
                    }));
                    return; // No iniciar contador si el extra ya está pagado
                }

                const intervalId = setInterval(() => {
                    const now = new Date();
                    const extraMinutes = Math.ceil((now.getTime() - initialEndTime.getTime()) / (1000 * 60));
                    const extraCost = extraMinutes * 2; // Asumiendo 2 Bs por minuto

                    setExtraTimeCounters(prev => ({
                        ...prev,
                        [reservation.id]: {
                            totalMinutes: extraMinutes,
                            totalCost: extraCost
                        }
                    }));
                }, 1000);

                intervalRefs.current[reservation.id] = intervalId;
            }
        });

        return () => {
            Object.values(intervalRefs.current).forEach(clearInterval);
        };
    }, [reservations]);


    const onPaymentSuccessHandler = (updatedReservation) => {
        setReservations(prev =>
            prev.map(r => (r.id === updatedReservation.id ? updatedReservation : r))
        );
        setSelectedReservation(null);
        setShowPaymentModal(false);

        if (updatedReservation.paidExtra && intervalRefs.current[updatedReservation.id]) {
            clearInterval(intervalRefs.current[updatedReservation.id]);
            delete intervalRefs.current[updatedReservation.id];
        }
        // Si el pago exitoso fue el inicial y `paid` es true, pero no es extra, no limpiar el contador
    };

    const handlePaymentClick = (reservation) => {
        if (reservation.paid) {
            showNotification("Esta reserva ya ha sido pagada.", "info");
            return;
        }
        setSelectedReservation({
            ...reservation,
            amountToPay: reservation.totalCost,
            isExtraPayment: false,
        });
        setShowPaymentModal(true);
    };

    const handleExtraPaymentClick = (reservation) => {
        if (!reservation.paid) {
            showNotification("Por favor, pague la reserva principal primero.", "warning");
            return;
        }

        if (reservation.paidExtra) {
            showNotification("El pago extra de esta reserva ya ha sido realizado.", "info");
            return;
        }

        const extraInfo = extraTimeCounters[reservation.id];
        if (!extraInfo || extraInfo.totalCost <= 0) {
            showNotification("No hay pago extra calculado para esta reserva o el tiempo extra es cero.", "info");
            return;
        }

        setSelectedReservation({
            ...reservation,
            amountToPay: extraInfo.totalCost,
            isExtraPayment: true,
        });
        setShowPaymentModal(true);
    };

    const handleMarkExit = async (reservationId) => {
        try {
            const updatedReservation = await markReservationAsExited(reservationId);
            showNotification("Salida marcada con éxito.", "success");
            setReservations(prev => prev.filter(r => r.id !== updatedReservation.id));
            if (intervalRefs.current[reservationId]) {
                clearInterval(intervalRefs.current[reservationId]);
                delete intervalRefs.current[reservationId];
            }
        } catch (err) {
            showNotification(err.response?.data?.message || 'Error al marcar salida.', 'error');
        }
    };

    const handleViewHistory = () => {
        navigate('/reservations/history');  // Redirige a la ruta del historial de reservas
    };


    if (loading) return <p className="text-center mt-8 text-gray-700">Cargando reservas...</p>;
    if (error) return <p className="text-center mt-8 text-red-600">Error: {error.message}</p>;

    return (
        <div className="flex h-screen bg-gray-100 mt-18">
            
            <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Reservas Activas</h2>
                        <button
                            onClick={handleViewHistory}
                            className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
                        >
                            Ver Historial de Reservas
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"> 

                        

                        {reservations.length > 0 ? (
                            reservations.map((res) => (
                                <AdminReservationCard
                                    key={res.id}
                                    reservation={res}
                                    extraTimeInfo={extraTimeCounters[res.id]}
                                    onPaymentClick={handlePaymentClick}
                                    onExtraPaymentClick={handleExtraPaymentClick}
                                    onMarkExit={handleMarkExit}
                                />
                            ))
                        ) : (
                            <p className="text-gray-60">No hay reservas activas.</p>
                        )}
                    </div>

                    {showPaymentModal && selectedReservation && (
                        <PaymentModal
                            reservation={selectedReservation}
                            amountToPay={selectedReservation.amountToPay}
                            isExtraPayment={selectedReservation.isExtraPayment}
                            onClose={() => {
                                setShowPaymentModal(false);
                                setSelectedReservation(null);
                            }}
                            onPaymentSuccess={onPaymentSuccessHandler}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Reservations;