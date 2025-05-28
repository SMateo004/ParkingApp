import { useState } from 'react';
import { markReservationEntryWithPatent, markReservationExitWithPatent } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export default function MarkEntryModal({ onClose, mode = 'entry' }) {
  const [patent, setPatent] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'entry') {
        await markReservationEntryWithPatent(patent);
        showNotification("Entrada registrada correctamente", "success");
      } else {
        await markReservationExitWithPatent(patent);
        showNotification("Salida registrada correctamente", "success");
      }
      onClose();
    } catch (err) {
      showNotification(err.response?.data?.error, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/75 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'entry' ? 'Registrar Entrada' : 'Registrar Salida'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={patent}
            onChange={(e) => setPatent(e.target.value)}
            placeholder="Placa del vehículo"
            className="w-full p-2 mb-4 border"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-400 px-4 py-2 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}