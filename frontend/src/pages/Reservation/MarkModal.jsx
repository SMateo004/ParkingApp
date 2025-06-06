import { useEffect, useRef, useState } from 'react';
import { markReservationEntryWithPatent, markReservationExitWithPatent } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export default function MarkEntryModal({ onClose, mode = 'entry' }) {
  const [patent, setPatent] = useState('');
  const { showNotification } = useNotification();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  const API_KEY = '16fa3edd0b401831ec254f4f0609bcdcd35a1487';

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        showNotification('No se pudo acceder a la cámara.', 'error');
        onClose();
      }
    };

    startCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

    const formData = new FormData();
    formData.append('upload', imageBlob);

    try {
      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      const plateRaw = data.results?.[0]?.plate?.toUpperCase();

      if (plateRaw && /^[0-9]{4}[A-Z]{3}$/.test(plateRaw)) {
        setPatent(plateRaw);
      }
    } catch (error) {
      console.error('Error en reconocimiento:', error);
      showNotification('Error al procesar la imagen.', 'error');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!patent && !processing) {
        captureAndRecognize();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [patent, processing]);

  useEffect(() => {
    if (patent && /^[0-9]{4}[A-Z]{3}$/.test(patent) && !processing) {
      setProcessing(true);
      const submitAutomatically = async () => {
        try {
          if (mode === 'entry') {
            await markReservationEntryWithPatent(patent);
            showNotification('Entrada registrada correctamente.', 'success');
          } else {
            await markReservationExitWithPatent(patent);
            showNotification('Salida registrada correctamente.', 'success');
          }
          stopCamera();
          onClose();
        } catch (err) {
          showNotification(err.response?.data?.error || 'Error al registrar.', 'error');
          setProcessing(false);
        }
      };
      submitAutomatically();
    }
  }, [patent]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4 relative">
        <h2 className="text-xl font-bold text-center">
          {mode === 'entry' ? 'Detectando entrada...' : 'Detectando salida...'}
        </h2>
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md border" />
        <div className="text-center">
          <p className="text-gray-700">Placa detectada: <strong>{patent || 'Detectando...'}</strong></p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
