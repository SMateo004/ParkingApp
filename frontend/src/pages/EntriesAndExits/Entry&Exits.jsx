import { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import MarkEntryModal from '../Reservation/MarkModal';

export default function MarkEntryPage() {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('entry');

  const openModal = (selectedMode) => {
    setMode(selectedMode);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Control de Entrada / Salida</h1>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button
            onClick={() => openModal('entry')}
            className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-6 rounded-lg flex items-center justify-center gap-4 shadow-md w-72"
          >
            <LogIn size={32} />
            Marcar Entrada
          </button>
          <button
            onClick={() => openModal('exit')}
            className="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-6 rounded-lg flex items-center justify-center gap-4 shadow-md w-72"
          >
            <LogOut size={32} />
            Marcar Salida
          </button>
        </div>
      </div>

      {showModal && (
        <MarkEntryModal
          mode={mode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}