import React from 'react';
import { ChefHat } from 'lucide-react';

const KitchenView = ({ company, activeOrders, exitRole, updateStatus }) => {
  // Filtramos pedidos que NO estén entregados (delivered)
  const ordersToShow = activeOrders.filter(o => o.status !== 'delivered');

  return (
    <div className="p-4 bg-slate-900 min-h-screen text-white font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h1 className="font-bold flex gap-2 text-xl items-center">
          <ChefHat className="text-orange-500" /> Cocina 
          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
            {company.id}
          </span>
        </h1>
        <button onClick={exitRole} className="text-sm opacity-60 hover:opacity-100">
          Salir
        </button>
      </header>

      {/* GRID DE PEDIDOS */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        
        {/* EMPTY STATE (Si no hay pedidos) */}
        {ordersToShow.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-600">
            <ChefHat size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl font-bold">Todo limpio, Chef.</p>
          </div>
        )}

        {/* MAPEO DE PEDIDOS */}
        {ordersToShow.map(o => (
          <div 
            key={o.id} 
            className={`p-4 rounded-xl border-l-4 shadow-lg flex flex-col ${
              o.status === 'ready' 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-orange-500 bg-slate-800'
            }`}
          >
            <div className="flex justify-between mb-2 items-start">
              <span className="font-bold text-xl">Mesa {o.table}</span>
              <span className="text-[10px] bg-slate-700 px-2 py-1 rounded uppercase tracking-widest">
                {o.status}
              </span>
            </div>

            <ul className="text-sm space-y-2 mb-4 flex-1">
              {o.items.map((it, i) => (
                <li key={i} className="border-b border-white/5 pb-1 text-slate-300">
                  {it.name} 
                  {it.note && (
                    <span className="block text-orange-400 text-xs font-bold mt-1">
                      ⚠️ {it.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* BOTONES DE ACCIÓN */}
            {o.status === 'pending' && (
              <button 
                onClick={() => updateStatus(o.id, 'cooking')} 
                className="w-full bg-orange-600 py-3 rounded-lg font-bold hover:bg-orange-500 transition-colors"
              >
                Empezar
              </button>
            )}

            {o.status === 'cooking' && (
              <button 
                onClick={() => updateStatus(o.id, 'ready')} 
                className="w-full bg-green-600 py-3 rounded-lg font-bold hover:bg-green-500 transition-colors"
              >
                ¡LISTO!
              </button>
            )}

            {o.status === 'ready' && (
              <div className="text-center text-green-500 font-bold text-sm animate-pulse">
                Esperando entrega...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenView;