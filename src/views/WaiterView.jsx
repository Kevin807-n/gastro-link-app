import React, { useState } from 'react';
import { User, LogOut, Utensils, Receipt, PlusCircle, ArrowRight, Box } from 'lucide-react';

const WaiterView = ({
  waiterName,
  company,
  companySettings,
  exitRole,
  waiterView,
  setWaiterView,
  TABLES,
  tableNum,
  setTableNum,
  CATEGORIES,
  selectedCategory,
  setSelectedCategory,
  menuItems,
  activeOrders,
  cart,
  sendOrder,
  myReadyOrders,
  updateStatus,
  // Props que vendrán desde App.jsx
  itemToCustomize, 
  setItemToCustomize,
  setCart
}) => {
  
  // Estado local para la nota y los modificadores del modal actual
  const [tempNote, setTempNote] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const getTableTotal = (t) => activeOrders.filter(o => o.table === t).reduce((a, b) => a + b.total, 0);

  // Convertir el texto "Queso:2000, Tocineta:3000" en una lista de objetos
  const getModifiersList = (item) => {
    if (!item.modifiers) return [];
    return item.modifiers.split(',').map(mod => {
        const parts = mod.split(':');
        // Si hay nombre y precio
        if (parts.length === 2) {
            return { name: parts[0].trim(), price: parseInt(parts[1]) };
        }
        // Si solo hay nombre (precio 0)
        return { name: parts[0].trim(), price: 0 };
    });
  };

  const handleAddToCart = () => {
     const extrasPrice = selectedModifiers.reduce((a, b) => a + b.price, 0);
     const finalItem = {
         ...itemToCustomize,
         price: itemToCustomize.price + extrasPrice, // Precio unitario final
         basePrice: itemToCustomize.price,
         note: tempNote.trim(),
         modifiers: selectedModifiers, // Guardamos los extras elegidos
         cid: Math.random() // ID único temporal para el carrito
     };
     setCart([...cart, finalItem]);
     
     // Limpiar y cerrar modal
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
    <div className="p-4 bg-white min-h-screen pb-24 font-sans relative">
      
      {/* NOTIFICACIONES (Pedidos Listos) */}
      {myReadyOrders.length > 0 && (
        <div className="fixed top-16 left-4 right-4 z-50 space-y-2 pointer-events-none">
          {myReadyOrders.map(o => (
            <div key={o.id} className="bg-green-600 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center pointer-events-auto">
              <span className="font-bold">🔔 Mesa {o.table} LISTA</span>
              <button onClick={(e) => { e.stopPropagation(); updateStatus(o.id, 'delivered'); }} className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold">Entregar</button>
            </div>
          ))}
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-4 bg-white sticky top-0 z-10 py-2 shadow-sm px-2 -mx-2">
        <div>
          <h1 className="font-black flex items-center gap-2 text-xl text-slate-800 tracking-tight"><User className="text-blue-600" /> {waiterName}</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{companySettings.name || company.id}</span>
            <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
          </div>
        </div>
        <button onClick={exitRole} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><LogOut size={20} /></button>
      </header>

      {/* MENU VISTA */}
      {waiterView === 'menu' ? (
        <>
          {/* SELECCIONAR MESA */}
          <div className="flex gap-2 overflow-x-auto mb-4 scrollbar-hide py-1">
            {TABLES.map(t => (
              <button key={t} onClick={() => setTableNum(t)} className={`px-4 py-3 rounded-xl border font-black text-lg transition-all ${tableNum === t ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white text-slate-300'}`}>{t}</button>
            ))}
          </div>
          
          {/* CATEGORIAS */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{c}</button>
            ))}
          </div>

          {/* LISTA DE PLATOS */}
          <div className="grid gap-3 pb-20">
            {menuItems.filter(i => selectedCategory === 'Todos' || i.category === selectedCategory).map(i => {
                // Verificar Stock: Si es undefined o "", asumimos infinito. Si es número <= 0, bloqueamos.
                const hasStockDefined = i.stock !== undefined && i.stock !== "";
                const isOutOfStock = hasStockDefined && parseInt(i.stock) <= 0;

                return (
                    <div 
                      key={i.id} 
                      onClick={() => !isOutOfStock && openModal(i)} 
                      className={`p-4 border border-slate-100 rounded-2xl flex justify-between items-center transition-colors shadow-sm bg-white ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'active:bg-blue-50 cursor-pointer'}`}
                    >
                      <div>
                        <div className="font-bold text-slate-700">{i.name}</div>
                        <div className="flex items-center gap-2">
                             <div className="text-blue-600 font-bold text-sm">${i.price.toLocaleString()}</div>
                             {/* Badge de Stock */}
                             {hasStockDefined && (
                                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${i.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                     <Box size={8}/> {i.stock}
                                 </span>
                             )}
                        </div>
                        {isOutOfStock && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Agotado</span>}
                      </div>
                      {!isOutOfStock && <PlusCircle size={24} className="text-blue-400"/>}
                    </div>
                );
            })} 
            {menuItems.length === 0 && <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-sm">Menú vacío.</div>}
          </div>
        </>
      ) : (
        /* VISTA DE CUENTAS */
        <div className="grid grid-cols-1 gap-3">
          {TABLES.map(t => {
            const tot = getTableTotal(t);
            if (tot === 0) return null;
            return (
              <div key={t} className="bg-white border p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                <div className="flex justify-between font-black text-xl mb-2 text-slate-800"><span>Mesa {t}</span><span>${tot.toLocaleString()}</span></div>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-500 text-center font-bold">Pendiente de pago</div>
              </div>
            );
          })}
          {activeOrders.length === 0 && <p className="text-center text-slate-400 mt-10 italic text-sm">Sin cuentas activas.</p>}
        </div>
      )}

      {/* CARRITO FLOTANTE */}
      {cart.length > 0 && waiterView === 'menu' && (
        <div className="fixed bottom-24 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-40 flex justify-between items-center animate-in slide-in-from-bottom-10">
          <div><div className="font-bold">Mesa {tableNum || "?"} • {cart.length}</div><div className="text-xs opacity-60">${cart.reduce((a, b) => a + b.price, 0).toLocaleString()}</div></div>
          <button onClick={sendOrder} className="bg-blue-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">ENVIAR <ArrowRight /></button>
        </div>
      )}

      {/* MODAL PERSONALIZACIÓN (CON EXTRAS) */}
      {itemToCustomize && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto flex flex-col">
            <h3 className="font-bold mb-1 text-lg text-slate-800">{itemToCustomize.name}</h3>
            {/* Precio dinámico: Base + Extras */}
            <p className="text-sm text-blue-600 font-bold mb-4">
               ${(itemToCustomize.price + selectedModifiers.reduce((a,b)=>a+b.price,0)).toLocaleString()}
            </p>
            
            {/* SECCIÓN DE EXTRAS/MODIFICADORES */}
            {itemToCustomize.modifiers && (
                <div className="mb-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Adicionales</label>
                    <div className="space-y-2">
                        {getModifiersList(itemToCustomize).map((mod, idx) => {
                            const isSelected = selectedModifiers.find(m => m.name === mod.name);
                            return (
                                <div key={idx} onClick={() => toggleModifier(mod)} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent'}`}>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{mod.name}</span>
                                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-500">+${mod.price}</span>
                                </div>
                            );
                        })}
                        {getModifiersList(itemToCustomize).length === 0 && <p className="text-xs text-slate-400">Sin adicionales configurados.</p>}
                    </div>
                </div>
            )}

            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Notas de Cocina</label>
            <textarea autoFocus value={tempNote} onChange={e => setTempNote(e.target.value)} className="w-full border p-3 rounded-xl mb-4 bg-slate-50 outline-none h-20 text-sm" placeholder="Ej: Sin cebolla, término medio..."/>
            
            <div className="flex gap-3 mt-auto">
              <button onClick={() => { setItemToCustomize(null); setTempNote(""); setSelectedModifiers([]); }} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500">Cancelar</button>
              <button onClick={handleAddToCart} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t p-2 flex justify-around z-50 pb-6 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setWaiterView('menu')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${waiterView === 'menu' ? 'text-blue-600 bg-blue-50' : 'text-slate-300'}`}><Utensils size={24} /><span className="text-[10px] font-bold">PEDIR</span></button>
        <button onClick={() => setWaiterView('bills')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${waiterView === 'bills' ? 'text-blue-600 bg-blue-50' : 'text-slate-300'}`}><Receipt size={24} /><span className="text-[10px] font-bold">CUENTAS</span></button>
      </div>
    </div>
  );
};

export default WaiterView;