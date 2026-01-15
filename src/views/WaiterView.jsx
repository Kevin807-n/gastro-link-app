import React, { useState } from 'react';
import { User, LogOut, Utensils, Receipt, PlusCircle, ArrowRight, Box, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const WaiterView = ({
  waiterName, company, companySettings, exitRole, waiterView, setWaiterView,
  TABLES, tableNum, setTableNum, CATEGORIES, selectedCategory, setSelectedCategory,
  menuItems, activeOrders, cart, sendOrder, myReadyOrders, updateStatus,
  itemToCustomize, setItemToCustomize, setCart
}) => {
  
  // Estado local para la nota y los modificadores del modal actual
  const [tempNote, setTempNote] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const getTableTotal = (t) => activeOrders.filter(o => o.table === t).reduce((a, b) => a + b.total, 0);

  // Convertir el texto de extras en objetos
  const getModifiersList = (item) => {
    if (!item.modifiers) return [];
    return item.modifiers.split(',').map(mod => {
        const parts = mod.split(':');
        if (parts.length === 2) {
            return { name: parts[0].trim(), price: parseInt(parts[1]) };
        }
        return { name: parts[0].trim(), price: 0 };
    });
  };

  const handleAddToCart = () => {
     const extrasPrice = selectedModifiers.reduce((a, b) => a + b.price, 0);
     const finalItem = {
         ...itemToCustomize,
         price: itemToCustomize.price + extrasPrice,
         basePrice: itemToCustomize.price,
         note: tempNote.trim(),
         modifiers: selectedModifiers,
         cid: Math.random()
     };
     setCart([...cart, finalItem]);
     setItemToCustomize(null);
     setTempNote("");
     setSelectedModifiers([]);
  };

  const toggleModifier = (mod) => {
      if (selectedModifiers.find(m => m.name === mod.name)) {
          setSelectedModifiers(selectedModifiers.filter(m => m.name !== mod.name));
      } else {
          setSelectedModifiers([...selectedModifiers, mod]);
      }
  };

  const openModal = (item) => {
      setTempNote("");
      setSelectedModifiers([]);
      setItemToCustomize(item);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-24 relative selection:bg-blue-500/30">
      
      {/* --- NOTIFICACIONES FLOTANTES (PEDIDOS LISTOS) --- */}
      {myReadyOrders.length > 0 && (
        <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
          {myReadyOrders.map(o => (
            <div key={o.id} className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl shadow-green-900/50 flex justify-between items-center pointer-events-auto animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 size={20}/></div>
                <div>
                  <span className="font-black block text-sm">MESA {o.table} LISTA</span>
                  <span className="text-xs opacity-90">Cocina terminó el pedido</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); updateStatus(o.id, 'delivered'); }} className="bg-white text-green-700 px-4 py-2 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-transform">
                Entregar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 rounded-full">
             <div className="bg-slate-900 p-1.5 rounded-full">
               <User className="text-blue-500" size={18} />
             </div>
          </div>
          <div>
             <h1 className="font-bold text-white text-sm leading-none">{waiterName}</h1>
             <div className="flex items-center gap-1.5 mt-1">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{companySettings.name || "GastroLink"}</span>
             </div>
          </div>
        </div>
        <button onClick={exitRole} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-red-400 hover:bg-slate-700 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="p-4 animate-in fade-in duration-500">
        
        {waiterView === 'menu' ? (
          <>
            {/* 1. SELECTOR DE MESA (Horizontal Scroll) */}
            <div className="mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Seleccionar Mesa</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {TABLES.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTableNum(t)} 
                    className={`flex-none w-16 h-16 rounded-2xl font-black text-xl flex items-center justify-center transition-all shadow-lg ${
                      tableNum === t 
                        ? 'bg-blue-600 text-white shadow-blue-900/50 scale-105 border-2 border-blue-400' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 2. CATEGORÍAS (Pills) */}
            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button 
                  key={c} 
                  onClick={() => setSelectedCategory(c)} 
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === c 
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/10 scale-105' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* 3. LISTA DE PLATOS (Grid Cards) */}
            <div className="grid gap-3">
              {menuItems.filter(i => selectedCategory === 'Todos' || i.category === selectedCategory).map(i => {
                  const hasStockDefined = i.stock !== undefined && i.stock !== "";
                  const isOutOfStock = hasStockDefined && parseInt(i.stock) <= 0;

                  return (
                      <div 
                        key={i.id} 
                        onClick={() => !isOutOfStock && openModal(i)} 
                        className={`p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center transition-all relative overflow-hidden group ${
                          isOutOfStock 
                            ? 'opacity-40 grayscale cursor-not-allowed' 
                            : 'active:scale-[0.98] active:bg-slate-800 hover:border-slate-700 shadow-lg'
                        }`}
                      >
                        {/* Glow effect on hover */}
                        {!isOutOfStock && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}

                        <div>
                          <span className="font-bold text-white text-base mb-1 block">{i.name}</span>
                          <div className="flex items-center gap-2">
                               <span className="text-blue-400 font-bold text-sm bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/20">
                                 ${i.price.toLocaleString()}
                               </span>
                               
                               {hasStockDefined && (
                                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                     i.stock < 5 
                                       ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                       : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                   }`}>
                                       <Box size={10}/> {i.stock}
                                   </span>
                               )}
                          </div>
                          {isOutOfStock && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 block flex items-center gap-1"><AlertCircle size={10}/> Agotado</span>}
                        </div>
                        
                        {!isOutOfStock && (
                          <div className="bg-slate-800 p-2 rounded-full text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <PlusCircle size={20}/>
                          </div>
                        )}
                      </div>
                  );
              })} 
              
              {menuItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-800 text-slate-600">
                    <Utensils size={24}/>
                  </div>
                  <p className="text-slate-500 text-sm">No hay platos en esta categoría.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- VISTA CUENTAS ACTIVAS --- */
          <div className="grid grid-cols-1 gap-3">
            <h2 className="text-xl font-bold text-white mb-4">Cuentas Abiertas</h2>
            {TABLES.map(t => {
              const tot = getTableTotal(t);
              if (tot === 0) return null;
              return (
                <div key={t} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-2xl text-white">Mesa {t}</span>
                    <span className="text-green-400 font-bold text-xl">${tot.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Pendiente</span>
                    <span className="text-xs text-slate-500">Solicitar pago en caja</span>
                  </div>
                </div>
              );
            })}
            {activeOrders.length === 0 && (
              <div className="text-center py-20 opacity-50">
                <Receipt size={48} className="mx-auto mb-4 text-slate-600"/>
                <p className="text-slate-400 italic">No hay mesas ocupadas.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CARRITO FLOTANTE (BOTTOM BAR) --- */}
      {cart.length > 0 && waiterView === 'menu' && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
          <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl flex justify-between items-center relative overflow-hidden">
             {/* Efecto brillo */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
             
             <div>
                <div className="font-black text-lg flex items-center gap-2">
                  Mesa {tableNum || "?"} <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-md">{cart.length}</span>
                </div>
                <div className="text-xs font-bold text-slate-500">Total: ${cart.reduce((a, b) => a + b.price, 0).toLocaleString()}</div>
             </div>
             
             <button onClick={sendOrder} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-slate-800">
               ENVIAR <ArrowRight size={18} />
             </button>
          </div>
        </div>
      )}

      {/* --- MODAL PERSONALIZACIÓN (GLASS DARK) --- */}
      {itemToCustomize && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-slate-900 w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border-t sm:border border-slate-700 animate-in slide-in-from-bottom-full sm:zoom-in-95 max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Handle para cerrar en móvil */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <h3 className="font-black text-2xl text-white mb-1">{itemToCustomize.name}</h3>
            <p className="text-lg text-blue-400 font-bold mb-6">
               ${(itemToCustomize.price + selectedModifiers.reduce((a,b)=>a+b.price,0)).toLocaleString()}
            </p>
            
            {/* EXTRAS */}
            {itemToCustomize.modifiers && (
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Adicionales</label>
                    <div className="space-y-2">
                        {getModifiersList(itemToCustomize).map((mod, idx) => {
                            const isSelected = selectedModifiers.find(m => m.name === mod.name);
                            return (
                                <div 
                                  key={idx} 
                                  onClick={() => toggleModifier(mod)} 
                                  className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                                  }`}
                                >
                                    <span className="text-sm font-bold">{mod.name}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                      +${mod.price}
                                    </span>
                                </div>
                            );
                        })}
                        {getModifiersList(itemToCustomize).length === 0 && <p className="text-xs text-slate-600 italic">Sin extras disponibles.</p>}
                    </div>
                </div>
            )}

            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Notas de Cocina</label>
            <textarea 
              value={tempNote} 
              onChange={e => setTempNote(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 outline-none focus:border-blue-500 text-white text-sm transition-colors placeholder:text-slate-600" 
              placeholder="Ej: Sin cebolla, término medio..."
              rows={3}
            />
            
            <div className="flex gap-3 mt-auto">
              <button onClick={() => { setItemToCustomize(null); setTempNote(""); setSelectedModifiers([]); }} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button onClick={handleAddToCart} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all">Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION (BARRA INFERIOR) --- */}
      <div className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-2 flex justify-around z-30 pb-6 safe-area-pb">
        <button onClick={() => setWaiterView('menu')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${waiterView === 'menu' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Utensils size={24} className={waiterView === 'menu' ? 'drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : ''} />
          <span className="text-[10px] font-bold tracking-wide">PEDIR</span>
        </button>
        <button onClick={() => setWaiterView('bills')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${waiterView === 'bills' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Receipt size={24} className={waiterView === 'bills' ? 'drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : ''} />
          <span className="text-[10px] font-bold tracking-wide">CUENTAS</span>
        </button>
      </div>
    </div>
  );
};

export default WaiterView;