import React from 'react';
import { ChefHat, Monitor, User, LogOut, Lock, ArrowRight } from 'lucide-react';

const RoleSelectView = ({ 
  company, requestLogout, setTargetRole, setIsPinModalOpen, 
  isPinModalOpen, targetRole, pinInput, setPinInput, handleRoleAuth,
  logoutConfirmOpen, confirmLogout, setLogoutConfirmOpen
}) => {

  const roles = [
    { id: 'admin', label: 'Administrador', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Control total, caja y menú' },
    { id: 'kitchen', label: 'Cocina', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Ver comandas pendientes' },
    { id: 'waiter', label: 'Mesero', icon: User, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', desc: 'Tomar pedidos en mesas' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">¿Quién eres hoy?</h1>
          <p className="text-slate-400">Selecciona tu perfil para ingresar a <span className="text-blue-400 font-bold">{company.id}</span></p>
        </div>

        {/* Grid de Roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => { setTargetRole(role.id); setIsPinModalOpen(true); }}
              className={`group relative p-6 rounded-3xl border ${role.border} bg-slate-900/50 hover:bg-slate-900 transition-all hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center gap-4`}
            >
              <div className={`p-4 rounded-2xl ${role.bg} ${role.color} group-hover:scale-110 transition-transform`}>
                <role.icon size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{role.label}</h3>
                <p className="text-xs text-slate-500 mt-2">{role.desc}</p>
              </div>
              <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                Ingresar <ArrowRight size={12}/>
              </div>
            </button>
          ))}
        </div>

        {/* Footer / Salir */}
        <div className="mt-12 text-center">
          <button 
            onClick={requestLogout}
            className="text-slate-500 hover:text-red-400 flex items-center justify-center gap-2 mx-auto text-sm font-bold transition-colors px-6 py-2 rounded-full hover:bg-slate-900"
          >
            <LogOut size={16}/> Cerrar Sesión en este dispositivo
          </button>
        </div>
      </div>

      {/* --- MODAL PIN (Diseño Dark) --- */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-xs p-8 rounded-3xl shadow-2xl border border-slate-800 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Lock size={24}/>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">PIN de Acceso</h3>
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">Perfil: {targetRole}</p>
            
            <input 
              type="password" 
              autoFocus
              maxLength={4}
              placeholder="••••"
              value={pinInput} 
              onChange={e => setPinInput(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 text-white text-center text-3xl font-black tracking-[0.5em] p-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-6 placeholder:text-slate-800"
            />
            
            <div className="grid grid-cols-2 gap-3">
               <button onClick={()=>setIsPinModalOpen(false)} className="py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors">Cancelar</button>
               <button onClick={handleRoleAuth} className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-transform active:scale-95">Entrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMAR SALIDA --- */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 p-6 rounded-2xl border border-red-500/20 text-center max-w-xs">
              <h3 className="text-white font-bold text-lg mb-2">¿Cerrar Sesión?</h3>
              <p className="text-slate-400 text-sm mb-6">Tendrás que ingresar el ID de la empresa nuevamente.</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutConfirmOpen(false)} className="flex-1 py-2 bg-slate-800 text-white rounded-lg font-bold">No</button>
                <button onClick={confirmLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Sí, Salir</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelectView;