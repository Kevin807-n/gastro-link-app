import React from 'react';
import { 
  Monitor, Settings, Power, LogOut, PlusCircle, 
  Trash2, Save, X, Printer, KeyRound, DollarSign, FileText, Calendar, Box 
} from 'lucide-react';
import KpiCard from '../components/KpiCard';

const AdminView = ({
  company,
  companySettings,
  storeStatus,
  toggleStoreStatus,
  exitRole,
  adminTab,
  setAdminTab,
  TABLES,
  activeOrders,
  selectedTableDetails,
  setSelectedTableDetails,
  payTable,
  menuItems,
  newItemForm,
  setNewItemForm,
  addMenuItem,
  deleteMenuItem,
  CATEGORIES,
  salesTotal,
  expenses,
  netProfit,
  waiterStats,
  newExpense,
  setNewExpense,
  addExpense,
  deleteExpense,
  settingsForm,
  setSettingsForm,
  saveSettings,
  settingsOpen,
  setSettingsOpen,
  handleCloseDay,
  dailyClosings
}) => {

  // Formato de fecha para el historial
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Monitor className="text-green-600"/>
          <div className="flex flex-col">
            <span className="font-black text-slate-800 text-lg uppercase leading-none">
              {companySettings.name || company.id}
            </span>
            {companySettings.name && (
              <span className="text-[10px] text-slate-400 font-bold tracking-widest">{company.id}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSettingsOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200">
            <Settings size={20}/>
          </button>
          
          <button 
            onClick={toggleStoreStatus} 
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${
              storeStatus === 'open' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            <Power size={14}/> {storeStatus === 'open' ? 'CERRAR' : 'ABRIR'}
          </button>
          
          <button onClick={exitRole} className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex p-4 gap-2 overflow-x-auto">
        {['pos', 'menu', 'finance', 'settings'].map(t => (
          <button 
            key={t} 
            onClick={() => setAdminTab(t)} 
            className={`flex-1 min-w-[100px] py-2 rounded-lg font-bold text-xs capitalize ${
              adminTab === t 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {t === 'pos' ? 'Caja' : t === 'finance' ? 'Finanzas' : t === 'settings' ? 'Config' : 'Menú'}
          </button>
        ))}
      </div>

      <div className="px-4 animate-in slide-in-from-bottom-4">
        
        {/* --- TAB: POS (CAJA) --- */}
        {adminTab === 'pos' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TABLES.map(t => {
              const tot = activeOrders.filter(o => o.table === t).reduce((a, b) => a + b.total, 0);
              return (
                <button 
                  key={t} 
                  onClick={() => tot > 0 ? setSelectedTableDetails(t) : null} 
                  className={`p-4 rounded-2xl border-2 h-28 flex flex-col items-center justify-center gap-1 transition-all ${
                    tot > 0 
                      ? 'bg-white border-red-500 shadow-md cursor-pointer' 
                      : 'bg-slate-100 border-dashed opacity-60 cursor-default'
                  }`}
                >
                  <span className="font-black text-lg text-slate-700">MESA {t}</span>
                  {tot > 0 ? (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ${tot.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Libre</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* --- TAB: MENÚ (AQUÍ ESTÁN LOS CAMBIOS DE STOCK) --- */}
        {adminTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-4 text-slate-700">Nuevo Plato</h3>
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      placeholder="Nombre" 
                      value={newItemForm.name} 
                      onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })} 
                      className="w-full md:flex-[2] bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3 w-full md:flex-1">
                        <input 
                          placeholder="Precio" 
                          type="number" 
                          value={newItemForm.price} 
                          onChange={e => setNewItemForm({ ...newItemForm, price: e.target.value })} 
                          className="w-full bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select 
                          value={newItemForm.category} 
                          onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })} 
                          className="w-full bg-slate-50 p-4 rounded-xl border outline-none bg-white focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* NUEVOS CAMPOS: STOCK Y ADICIONALES */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full md:w-1/3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stock Inicial</label>
                        <input 
                          placeholder="Ej: 50" 
                          type="number" 
                          value={newItemForm.stock || ''} 
                          onChange={e => setNewItemForm({ ...newItemForm, stock: e.target.value })} 
                          className="w-full bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Adicionales (Nombre:Precio, Nombre:Precio)</label>
                        <input 
                          placeholder="Ej: Queso:2000, Tocineta:3000" 
                          value={newItemForm.modifiers || ''} 
                          onChange={e => setNewItemForm({ ...newItemForm, modifiers: e.target.value })} 
                          className="w-full bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                <button onClick={addMenuItem} className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
                  <PlusCircle size={20}/> <span className="md:hidden">Guardar</span><span className="hidden md:inline">Crear Plato</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {menuItems.map(item => (
                <div key={item.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <span className="font-bold block text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase">{item.category}</span>
                      <span className="text-sm font-bold text-blue-600">${item.price.toLocaleString()}</span>
                      
                      {/* VISUALIZAR STOCK (SI EXISTE) */}
                      {item.stock !== undefined && item.stock !== "" && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${item.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                           <Box size={10}/> Stock: {item.stock}
                        </span>
                      )}
                    </div>
                    {/* VISUALIZAR SI TIENE ADICIONALES */}
                    {item.modifiers && <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">Extras: {item.modifiers}</p>}
                  </div>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-3 text-slate-300 hover:text-red-500">
                    <Trash2 size={20}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: FINANZAS (MANTENEMOS EL HISTORIAL Y CIERRE) --- */}
        {adminTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <KpiCard t="Ventas Hoy" v={salesTotal} c="green"/>
              <KpiCard t="Gastos Hoy" v={expenses.reduce((a, b) => a + b.amount, 0)} c="red"/>
              <KpiCard t="Ganancia Neta" v={netProfit} c="blue"/>
            </div>

            {/* BOTÓN CIERRE */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-400"><DollarSign/> Cierre de Caja (Z)</h3>
                <p className="text-slate-400 text-sm">Archiva las ventas de hoy y reinicia el contador.</p>
              </div>
              <button 
                onClick={handleCloseDay} 
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
              >
                <FileText size={20}/> CERRAR EL DÍA
              </button>
            </div>
            
            {/* HISTORIAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-700 mb-4 text-lg flex items-center gap-2">
                 <Calendar size={20} className="text-blue-500"/> Historial de Cierres
               </h3>
               {(!dailyClosings || dailyClosings.length === 0) ? (
                 <p className="text-sm text-slate-400 italic">No hay cierres registrados aún.</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                       <tr><th className="p-3">Fecha</th><th className="p-3">Ventas</th><th className="p-3">Gastos</th><th className="p-3">Ganancia</th></tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {dailyClosings.map(close => (
                         <tr key={close.id} className="hover:bg-slate-50">
                           <td className="p-3 font-medium text-slate-700">{formatDate(close.date)}</td>
                           <td className="p-3 text-green-600 font-bold">${close.sales?.toLocaleString()}</td>
                           <td className="p-3 text-red-500 font-bold">-${close.expenses?.toLocaleString()}</td>
                           <td className="p-3 text-blue-600 font-black">${close.profit?.toLocaleString()}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>

            {/* RANKING Y GASTOS (MANTENIDOS) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 text-lg">Ranking Meseros (Hoy)</h3>
              {Object.entries(waiterStats).sort((a, b) => b[1] - a[1]).map(([n, v], i) => (
                <div key={n} className="flex justify-between items-center border-b border-slate-50 py-3 last:border-0">
                  <div className="flex items-center gap-3"><span className="font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">#{i + 1}</span><span className="font-medium text-slate-700">{n}</span></div>
                  <span className="font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">${v.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 text-lg">Registrar Gasto</h3>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input placeholder="Motivo" value={newExpense.desc} onChange={e => setNewExpense({ ...newExpense, desc: e.target.value })} className="w-full md:flex-[2] border border-slate-200 bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                <div className="flex gap-3 w-full md:flex-1">
                  <input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full border border-slate-200 bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                  <button onClick={addExpense} className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center"><PlusCircle size={24}/></button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 hover:bg-slate-50 p-2 rounded-lg group">
                    <span className="text-slate-600 font-medium">{e.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">-${e.amount.toLocaleString()}</span>
                      <button onClick={() => deleteExpense(e.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: SETTINGS (MANTENEMOS LOS PINS) --- */}
        {adminTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5 border border-slate-100">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
              <Settings className="text-blue-600"/> Datos del Negocio
            </h3>
            
            {/* Campos */}
            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Visible</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 mt-1" placeholder="Ej: Pizzería Don Pepe" value={settingsForm.name || ''} onChange={e=>setSettingsForm({...settingsForm, name:e.target.value})}/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">NIT / Documento</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.nit} onChange={e=>setSettingsForm({...settingsForm, nit:e.target.value})}/></div>
               <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.phone} onChange={e=>setSettingsForm({...settingsForm, phone:e.target.value})}/></div>
            </div>
            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.address} onChange={e=>setSettingsForm({...settingsForm, address:e.target.value})}/></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensaje Ticket</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" placeholder="¡Gracias por su visita!" value={settingsForm.footer} onChange={e=>setSettingsForm({...settingsForm, footer:e.target.value})}/></div>
             
             {/* PINS */}
             <div className="border-t pt-5 mt-5">
               <h4 className="font-bold text-lg text-slate-700 mb-3 flex items-center gap-2"><KeyRound size={20} className="text-orange-500"/> Seguridad / PINs</h4>
               <div className="grid grid-cols-3 gap-3">
                 <div><label className="text-[10px] font-bold text-slate-400 uppercase">Admin</label><input className="w-full bg-orange-50 p-3 rounded-xl border border-orange-100 outline-none text-center font-black text-slate-700 focus:ring-2 focus:ring-orange-500" maxLength={4} value={settingsForm.pinAdmin || ''} onChange={e=>setSettingsForm({...settingsForm, pinAdmin:e.target.value})} placeholder="1234"/></div>
                 <div><label className="text-[10px] font-bold text-slate-400 uppercase">Cocina</label><input className="w-full bg-orange-50 p-3 rounded-xl border border-orange-100 outline-none text-center font-black text-slate-700 focus:ring-2 focus:ring-orange-500" maxLength={4} value={settingsForm.pinKitchen || ''} onChange={e=>setSettingsForm({...settingsForm, pinKitchen:e.target.value})} placeholder="5555"/></div>
                 <div><label className="text-[10px] font-bold text-slate-400 uppercase">Mesero</label><input className="w-full bg-orange-50 p-3 rounded-xl border border-orange-100 outline-none text-center font-black text-slate-700 focus:ring-2 focus:ring-orange-500" maxLength={4} value={settingsForm.pinWaiter || ''} onChange={e=>setSettingsForm({...settingsForm, pinWaiter:e.target.value})} placeholder="0000"/></div>
               </div>
             </div>

             <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo URL (Opcional)</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1 text-slate-400" placeholder="https://..." value={settingsForm.logoUrl} onChange={e=>setSettingsForm({...settingsForm, logoUrl:e.target.value})}/></div>

            <button onClick={saveSettings} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2">
              <Save size={20}/> Guardar Configuración
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETALLES MESA (POS) */}
      {selectedTableDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4"><h3 className="font-black text-xl text-slate-800">Mesa {selectedTableDetails}</h3><button onClick={() => setSelectedTableDetails(null)}><X/></button></div>
            <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
              {activeOrders.filter(o => o.table === selectedTableDetails).flatMap(o => o.items).map((it, i) => (
                <div key={i} className="flex justify-between text-xs border-b border-slate-100 pb-1">
                  <span>{it.name}</span>
                  <span>${it.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-lg mb-4 pt-2 border-t">
              <span>TOTAL</span>
              <span className="text-green-600">
                ${activeOrders.filter(o => o.table === selectedTableDetails).reduce((a, b) => a + b.total, 0).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => payTable(selectedTableDetails, false)} className="bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm">
                Solo Pagar
              </button>
              <button onClick={() => payTable(selectedTableDetails, true)} className="bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                <Printer size={16}/> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SETTINGS FLOTANTE */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                <Settings size={20}/> Configuración
              </h3>
              <button onClick={() => setSettingsOpen(false)}><X/></button>
            </div>
            <p className="text-center text-slate-500 text-sm mb-4">
              Ve a la pestaña <b>"Config"</b> en el menú principal para editar todos los detalles.
            </p>
            <button onClick={() => { setSettingsOpen(false); setAdminTab('settings'); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">
              Ir a Configuración Completa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;