import React from 'react';
import { AlertTriangle } from 'lucide-react';

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-2xl text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Cerrar Sesión?</h3>
        <p className="text-slate-500 text-sm mb-6">Tendrás que ingresar el ID de empresa nuevamente.</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg"
          >
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;