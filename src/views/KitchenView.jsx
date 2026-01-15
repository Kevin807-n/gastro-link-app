import React from 'react';
import { ChefHat, Clock, CheckCircle, LogOut, AlertCircle, UtensilsCrossed } from 'lucide-react';

const KitchenView = ({ company, activeOrders, exitRole, updateStatus }) => {
  
  // Filtrar solo lo que la cocina debe ver (pending o cooking)
  // Ocultamos los 'ready' (ya están para el mesero) y 'delivered/paid'
  const kitchenOrders = activeOrders.filter(o => o.status === 'pending' || o.status === 'cooking');

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcular tiempo transcurrido (simple)
  const getElapsedMinutes = (timestamp) => {
      if (!timestamp) return 0;
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 60000); // diferencia en minutos
      return diff;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4">
      
      {/* HEADER COCINA */}
      <header className="flex justify-between items-center mb-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg sticky top-4 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
            <ChefHat className="text-orange-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">COCINA</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En vivo • {kitchenOrders.length} Pendientes
            </p>
          </div>
        </div>
        <button onClick={exitRole} className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-3 rounded-xl transition-colors">
          <LogOut size={20}/>
        </button>
      </header>

      {/* GRID DE COMANDAS */}
      {kitchenOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
          <UtensilsCrossed size={64} className="text-slate-600 mb-4"/>
          <h2 className="text-xl font-bold text-slate-500">Todo limpio, Chef.</h2>
          <p className="text-sm text-slate-600">Esperando nuevos pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {kitchenOrders.map(order => {
            const mins = getElapsedMinutes(order.createdAt);
            const isLate = mins > 20; // Alerta si lleva más de 20 mins

            return (
              <div 
                key={order.id} 
                className={`bg-slate-900 border rounded-2xl flex flex-col shadow-xl overflow-hidden transition-all ${
                  isLate ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-800'
                }`}
              >
                {/* CABECERA DE LA COMANDA */}
                <div className={`p-4 flex justify-between items-center ${isLate ? 'bg-red-500/10' : 'bg-slate-800/50'}`}>
                  <div className="flex flex-col">
                    <span className="font-black text-2xl text-white">MESA {order.table}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{order.waiterName || 'Mesero'}</span>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-mono font-bold text-lg ${isLate ? 'text-red-400' : 'text-blue-400'}`}>
                      <Clock size={16}/> {formatTime(order.createdAt)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Hace {mins} min</span>
                  </div>
                </div>

                {/* LISTA DE ITEMS */}
                <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-lg text-slate-200 leading-tight">{item.name}</span>
                        {/* Cantidad si quisieras agrupar, por ahora 1 */}
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded font-bold">x1</span>
                      </div>
                      
                      {/* MODIFICADORES / EXTRAS */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.modifiers.map((m, i) => (
                            <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                              + {m.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* NOTAS DE COCINA */}
                      {item.note && (
                        <div className="mt-2 flex gap-2 items-start bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                          <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0"/>
                          <p className="text-xs text-yellow-200 font-medium italic">"{item.note}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ACCIONES */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')} 
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle size={20}/> MARCAR LISTO
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenView;