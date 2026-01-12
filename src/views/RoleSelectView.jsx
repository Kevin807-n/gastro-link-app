import React from 'react';
import { Store, LogOut, User, ChefHat, Monitor } from 'lucide-react';
import RoleCard from '../components/RoleCard';      // Importamos tu componente
import LogoutModal from '../components/LogoutModal'; // Importamos tu modal

const RoleSelectView = ({ 
  company, 
  requestLogout, 
  setTargetRole, 
  setIsPinModalOpen, 
  isPinModalOpen, 
  targetRole, 
  pinInput, 
  setPinInput, 
  handleRoleAuth, 
  logoutConfirmOpen, 
  confirmLogout, 
  setLogoutConfirmOpen 
}) => {

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      {/* Cabecera de la empresa */}
      <div className="bg-white px-5 py-3 rounded-full shadow mb-8 flex items-center gap-3 w-full max-w-sm justify-between">
        <div className="flex items-center gap-2">
          <Store size={18} className="text-blue-600"/>
          <span className="font-bold text-slate-700 uppercase">{company.id}</span>
        </div>
        <button 
          onClick={requestLogout} 
          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
        >
          <LogOut size={18}/>
        </button>
      </div>

      <h1 className="text-2xl font-black text-slate-800 mb-6 text-center">Selecciona Rol</h1>
      
      {/* Tarjetas de Selección */}
      <div className="grid gap-4 w-full max-w-sm">
        <RoleCard 
          icon={User} 
          title="Mesero" 
          color="blue" 
          onClick={() => { setTargetRole('waiter'); setIsPinModalOpen(true); }}
        />
        <RoleCard 
          icon={ChefHat} 
          title="Cocina" 
          color="orange" 
          onClick={() => { setTargetRole('kitchen'); setIsPinModalOpen(true); }}
        />
        <RoleCard 
          icon={Monitor} 
          title="Gerencia" 
          color="green" 
          onClick={() => { setTargetRole('admin'); setIsPinModalOpen(true); }}
        />
      </div>

      {/* Modal de PIN (Específico para esta vista) */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold mb-4 text-xl">PIN {targetRole}</h3>
            <input 
              type="password" 
              value={pinInput} 
              onChange={(e) => setPinInput(e.target.value)} 
              className="w-full bg-slate-100 p-4 rounded text-center text-3xl font-bold mb-4 outline-none" 
              maxLength={4} 
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPinModalOpen(false)} 
                className="flex-1 bg-slate-200 py-3 rounded font-bold text-slate-600"
              >
                X
              </button>
              <button 
                onClick={handleRoleAuth} 
                className="flex-1 bg-blue-600 text-white py-3 rounded font-bold shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Salida */}
      {logoutConfirmOpen && (
        <LogoutModal 
          onConfirm={confirmLogout} 
          onCancel={() => setLogoutConfirmOpen(false)} 
        />
      )}
    </div>
  );
};

export default RoleSelectView;