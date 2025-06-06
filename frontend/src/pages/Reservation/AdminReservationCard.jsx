// src/components/Cards/AdminReservationCard.jsx
import React from 'react';
import { format } from 'date-fns';

const AdminReservationCard = ({ reservation, extraTimeInfo, onPaymentClick, onExtraPaymentClick, onMarkExit }) => {
    const now = new Date();
    const endTime = new Date(reservation.endTime);
    const hasExceededTime = now > endTime;

    const isPaid = reservation.paid; // Estado de pago inicial
    const hasCalculatedExtraCharges = extraTimeInfo && extraTimeInfo.totalCost > 0; // Si hay un monto extra calculado por el frontend
    const isExtraPaid = reservation.paidExtra; // Estado de pago extra (del backend)

    // Lógica para habilitar/deshabilitar el botón "Marcar Salida"
    // Se puede marcar salida si:
    // 1. El pago inicial está hecho (isPaid = true)
    // 2. Y si hay tiempo extra (hasExceededTime) Y hay un costo extra calculado (hasCalculatedExtraCharges), entonces el pago extra debe estar hecho (isExtraPaid = true).
    //    Si no hay tiempo extra, no necesitamos verificar isExtraPaid.
    const canMarkExit = isPaid && (!hasExceededTime || isExtraPaid);


    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reserva ID: {reservation.id}</h3>
            <p className="text-gray-700"><strong>Estacionamiento:</strong> {reservation.Parking?.name}</p>
            <p className="text-gray-700"><strong>Vehículo:</strong> {reservation.Vehicle?.carPatent}</p>
            <p className="text-gray-700"><strong>Usuario:</strong> {reservation.User?.name}</p>
            <p className="text-gray-700">
                <strong>Inicio:</strong> {format(new Date(reservation.startTime), 'dd/MM/yyyy HH:mm')}
            </p>
            <p className="text-gray-700">
                <strong>Fin Programado:</strong> {format(new Date(reservation.endTime), 'dd/MM/yyyy HH:mm')}
            </p>
            <p className="text-gray-700">
                <strong>Costo Total Inicial:</strong> {reservation.totalCost} Bs
            </p>
            <p className="text-gray-700">
                <strong>Estado Pago Inicial:</strong>{" "}
                <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {isPaid ? 'Pagado' : 'Pendiente'}
                </span>
            </p>

            {hasExceededTime && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                    <p className="font-semibold">Tiempo Excedido:</p>
                    {extraTimeInfo ? (
                        <>
                            <p>{extraTimeInfo.totalMinutes} minutos extra</p>
                            <p>Costo Extra Calculado: {extraTimeInfo.totalCost} Bs</p>
                            <p>
                                <strong>Estado Pago Extra:</strong>{" "}
                                <span className={`font-semibold ${isExtraPaid ? 'text-green-600' : 'text-red-600'}`}>
                                    {isExtraPaid ? `Pagado (${reservation.extraCharges} Bs)` : 'Pendiente'}
                                </span>
                            </p>
                        </>
                    ) : (
                        <p>Calculando costo extra...</p>
                    )}
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
                {/* Botón de Pago Normal: Visible solo si el pago inicial NO ha sido realizado */}
                {!isPaid && (
                    <button
                        onClick={() => onPaymentClick(reservation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    >
                        Pagar ({reservation.totalCost} Bs)
                    </button>
                )}

                {/* Botón de Pago Extra: Visible si ya excedió el tiempo, hay costo extra calculado,
                    el pago inicial está hecho y el pago extra NO ha sido realizado */}
                {isPaid && hasExceededTime && hasCalculatedExtraCharges && !isExtraPaid && (
                    <button
                        onClick={() => onExtraPaymentClick(reservation)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 transition-colors"
                    >
                        Pagar Extra ({extraTimeInfo.totalCost} Bs)
                    </button>
                )}

                {/* Botón Marcar Salida: Habilitado solo si se cumplen las condiciones de pago */}
                <button
                    onClick={() => onMarkExit(reservation.id)}
                    className={`px-4 py-2 rounded-md transition-colors ${canMarkExit
                        ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!canMarkExit}
                >
                    Marcar Salida
                </button>
            </div>
        </div>
    );
};

export default AdminReservationCard;