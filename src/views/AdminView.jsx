import React from 'react';
import { 
  Monitor, Settings, Power, LogOut, PlusCircle, 
  Trash2, Save, X, Printer, KeyRound, DollarSign, FileText, Calendar, Box, TrendingUp, User, History 
} from 'lucide-react';
import KpiCard from '../components/KpiCard';

const AdminView = ({
  company, companySettings, storeStatus, toggleStoreStatus, exitRole, adminTab, setAdminTab,
  TABLES, activeOrders, selectedTableDetails, setSelectedTableDetails, payTable,
  menuItems, newItemForm, setNewItemForm, addMenuItem, deleteMenuItem, CATEGORIES,
  salesTotal, expenses, netProfit, waiterStats, newExpense, setNewExpense, addExpense, deleteExpense,
  settingsForm, setSettingsForm, saveSettings, settingsOpen, setSettingsOpen,
  handleCloseDay, dailyClosings
}) => {

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Componente de Botón de Pestaña (Para mantener el código limpio)
  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setAdminTab(id)} 
      className={`flex-1 min-w-[80px] py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${
        adminTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' 
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {Icon && <Icon size={18} />} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      
      {/* --- HEADER --- */}
      <header className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 sticky top-0 z-20 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/50">
             <Monitor className="text-white" size={20}/>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-lg tracking-tight leading-none">
              {companySettings.name || "GastroLink"}
            </span>
            <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-1">{company.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleStoreStatus} 
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border ${
              storeStatus === 'open' 
                ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20'
            }`}
          >
            <Power size={14}/> <span className="hidden md:inline">{storeStatus === 'open' ? 'CERRAR LOCAL' : 'ABRIR LOCAL'}</span>
          </button>
          <button onClick={exitRole} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      {/* --- NAVEGACIÓN (5 PESTAÑAS AHORA) --- */}
      <div className="flex p-4 gap-2 overflow-x-auto sticky top-[76px] z-10 bg-slate-950/95 backdrop-blur pb-4 border-b border-slate-900 scrollbar-hide">
        <TabButton id="pos" label="Caja" icon={Monitor} />
        <TabButton id="menu" label="Menú" icon={Box} />
        <TabButton id="finance" label="Finanzas" icon={TrendingUp} />
        <TabButton id="history" label="Cierre/Hist" icon={History} /> {/* NUEVA PESTAÑA */}
        <TabButton id="settings" label="Config" icon={Settings} />
      </div>

      <div className="px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ======================= TAB 1: CAJA (POS) ======================= */}
        {adminTab === 'pos' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {TABLES.map(t => {
              const tot = activeOrders.filter(o => o.table === t).reduce((a, b) => a + b.total, 0);
              const isBusy = tot > 0;
              return (
                <button 
                  key={t} 
                  onClick={() => isBusy ? setSelectedTableDetails(t) : null} 
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 h-36 relative overflow-hidden group ${
                    isBusy 
                      ? 'bg-slate-800 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <span className={`font-black text-3xl ${isBusy ? 'text-white' : 'text-slate-700'}`}>{t}</span>
                  {isBusy ? (
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ${tot.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Disponible</span>
                  )}
                  {isBusy && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>}
                </button>
              );
            })}
          </div>
        )}

        {/* ======================= TAB 2: MENÚ ======================= */}
        {adminTab === 'menu' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Formulario Crear */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2"><PlusCircle className="text-blue-500"/> Agregar Producto</h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <input placeholder="Nombre del plato" value={newItemForm.name} onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })} className="flex-[2] bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"/>
                    <div className="flex gap-4 flex-1">
                        <input placeholder="Precio" type="number" value={newItemForm.price} onChange={e => setNewItemForm({ ...newItemForm, price: e.target.value })} className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"/>
                        <select value={newItemForm.category} onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })} className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                        <input placeholder="Stock (Ej: 50)" type="number" value={newItemForm.stock || ''} onChange={e => setNewItemForm({ ...newItemForm, stock: e.target.value })} className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 placeholder:text-slate-600"/>
                    </div>
                    <div className="w-full">
                        <input placeholder="Extras (Queso:2000, Tocineta:3000)" value={newItemForm.modifiers || ''} onChange={e => setNewItemForm({ ...newItemForm, modifiers: e.target.value })} className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 placeholder:text-slate-600"/>
                    </div>
                </div>
                <button onClick={addMenuItem} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]">
                  Guardar Producto
                </button>
              </div>
            </div>

            {/* Lista Items */}
            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition-all group hover:shadow-lg hover:shadow-black/20">
                  <div>
                    <span className="font-bold block text-white text-lg group-hover:text-blue-400 transition-colors">{item.name}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider">{item.category}</span>
                      <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">${item.price.toLocaleString()}</span>
                      {item.stock !== undefined && item.stock !== "" && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${item.stock < 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                           <Box size={10}/> {item.stock}
                        </span>
                      )}
                    </div>
                    {item.modifiers && <p className="text-xs text-slate-500 mt-2 font-mono">{item.modifiers}</p>}
                  </div>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 size={20}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: FINANZAS (OPERATIVO HOY) ======================= */}
        {adminTab === 'finance' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard t="Ventas Hoy" v={salesTotal} c="green" dark={true}/>
              <KpiCard t="Gastos Hoy" v={expenses.reduce((a, b) => a + b.amount, 0)} c="red" dark={true}/>
              <KpiCard t="Ganancia Neta" v={netProfit} c="blue" dark={true}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Ranking de Meseros */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><User size={18} className="text-purple-500"/> Ranking Meseros (Hoy)</h3>
                  {Object.entries(waiterStats).length === 0 ? <p className="text-sm text-slate-500 italic">Sin ventas hoy.</p> : null}
                  <div className="space-y-3">
                    {Object.entries(waiterStats).sort((a, b) => b[1] - a[1]).map(([n, v], i) => (
                      <div key={n} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-slate-400">#{i + 1}</span>
                          <span className="font-medium text-slate-300">{n}</span>
                        </div>
                        <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">${v.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gastos (Caja Menor) */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-red-500"/> Caja Menor (Gastos)</h3>
                  <div className="flex gap-2 mb-4">
                    <input placeholder="Motivo" value={newExpense.desc} onChange={e => setNewItemForm({ ...newExpense, desc: e.target.value })} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500"/>
                    <input type="number" placeholder="$" value={newExpense.amount} onChange={e => setNewItemForm({ ...newExpense, amount: e.target.value })} className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500"/>
                    <button onClick={addExpense} className="bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 p-2 rounded-lg transition-colors"><PlusCircle size={20}/></button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {expenses.map(e => (
                      <div key={e.id} className="flex justify-between items-center text-xs p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-slate-300">{e.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold">-${e.amount.toLocaleString()}</span>
                          <button onClick={() => deleteExpense(e.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: HISTORIAL Y CIERRE (NUEVO) ======================= */}
        {adminTab === 'history' && (
           <div className="space-y-6 max-w-4xl mx-auto">
             {/* Cierre de Caja (Hero Section) */}
             <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-3xl shadow-xl border border-blue-500/20">
               <div className="bg-slate-950/80 p-8 rounded-[22px] flex flex-col items-center justify-center gap-6 text-center backdrop-blur-sm">
                 <div className="bg-slate-800 p-4 rounded-full">
                    <DollarSign size={40} className="text-yellow-400"/>
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-white">Cierre de Caja (Corte Z)</h3>
                   <p className="text-slate-400 mt-2 max-w-md mx-auto">Al cerrar, las ventas de HOY volverán a cero y se guardará un reporte permanente. <br/> <span className="text-yellow-500 font-bold">Asegúrate de haber terminado el turno.</span></p>
                 </div>
                 <button onClick={handleCloseDay} className="bg-red-600 hover:bg-red-500 px-10 py-4 rounded-xl font-bold text-white shadow-lg shadow-red-900/50 transition-all active:scale-95 flex items-center gap-2 text-lg">
                   <FileText size={24}/> CERRAR EL DÍA
                 </button>
               </div>
             </div>

             {/* Tabla de Historial */}
             <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg"><Calendar size={20} className="text-blue-500"/> Historial de Cierres Anteriores</h3>
                {(!dailyClosings || dailyClosings.length === 0) ? <p className="text-slate-500 italic text-center py-10">No hay historial disponible.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr><th className="py-3 pl-2">Fecha</th><th className="py-3">Ventas</th><th className="py-3">Gastos</th><th className="py-3 pr-2 text-right">Ganancia</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {dailyClosings.map(close => (
                          <tr key={close.id} className="group hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 pl-2 text-slate-300 font-medium group-hover:text-white">{formatDate(close.date)}</td>
                            <td className="py-4 text-slate-400">${close.sales?.toLocaleString()}</td>
                            <td className="py-4 text-red-400">-${close.expenses?.toLocaleString()}</td>
                            <td className="py-4 pr-2 text-right text-green-400 font-bold text-base shadow-green-500/5">${close.profit?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
           </div>
        )}

        {/* ======================= TAB 5: CONFIG ======================= */}
        {adminTab === 'settings' && (
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-8">
            <h3 className="font-bold text-2xl text-white flex items-center gap-3"><Settings className="text-blue-500"/> Configuración</h3>
            
            <div className="space-y-5">
                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del Restaurante</label>
                    <input className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-lg" value={settingsForm.name || ''} onChange={e=>setSettingsForm({...settingsForm, name:e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">NIT</label><input className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors" value={settingsForm.nit} onChange={e=>setSettingsForm({...settingsForm, nit:e.target.value})}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Teléfono</label><input className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors" value={settingsForm.phone} onChange={e=>setSettingsForm({...settingsForm, phone:e.target.value})}/></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Dirección</label><input className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors" value={settingsForm.address} onChange={e=>setSettingsForm({...settingsForm, address:e.target.value})}/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Pie de Página (Ticket)</label><input className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors" value={settingsForm.footer} onChange={e=>setSettingsForm({...settingsForm, footer:e.target.value})}/></div>
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mt-6">
                   <h4 className="font-bold text-slate-300 mb-6 flex gap-2 text-sm uppercase tracking-wider"><KeyRound size={16} className="text-orange-500"/> Seguridad (PINs de Acceso)</h4>
                   <div className="grid grid-cols-3 gap-4">
                     {['Admin', 'Kitchen', 'Waiter'].map(role => (
                         <div key={role}>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">{role}</label>
                             <input className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-center font-mono font-bold text-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" maxLength={4} value={settingsForm[`pin${role}`] || ''} onChange={e=>setSettingsForm({...settingsForm, [`pin${role}`]:e.target.value})} placeholder="****"/>
                         </div>
                     ))}
                   </div>
                </div>
                
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Logo URL (Opcional)</label><input className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 transition-colors text-xs text-slate-400" value={settingsForm.logoUrl} onChange={e=>setSettingsForm({...settingsForm, logoUrl:e.target.value})} placeholder="https://..."/></div>
            </div>

            <button onClick={saveSettings} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 mt-4 flex justify-center gap-2 transform active:scale-[0.98] transition-all">
              <Save size={20}/> Guardar Cambios
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL DETALLES MESA --- */}
      {selectedTableDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <h3 className="font-black text-2xl text-white">Mesa {selectedTableDetails}</h3>
                <button onClick={() => setSelectedTableDetails(null)} className="p-2 bg-slate-800 rounded-full text-slate-500 hover:text-white hover:bg-slate-700"><X size={20}/></button>
            </div>
            <div className="max-h-60 overflow-y-auto mb-6 space-y-3 pr-2 scrollbar-hide">
              {activeOrders.filter(o => o.table === selectedTableDetails).flatMap(o => o.items).map((it, i) => (
                <div key={i} className="flex justify-between items-start text-sm border-b border-slate-800/50 pb-3 mb-2 last:border-0 last:mb-0 text-slate-300">
                  <div>
                    <span className="font-bold block text-white text-base">{it.name}</span>
                    {it.modifiers && it.modifiers.length > 0 && <span className="text-xs text-blue-400 font-medium block mt-1">+ {it.modifiers.map(m=>m.name).join(', ')}</span>}
                    {it.note && <span className="text-xs text-slate-500 italic block mt-0.5">"{it.note}"</span>}
                  </div>
                  <span className="font-bold text-slate-200">${it.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-2xl mb-8 pt-4 border-t border-slate-800 text-white">
              <span>Total</span>
              <span className="text-green-400">${activeOrders.filter(o => o.table === selectedTableDetails).reduce((a, b) => a + b.total, 0).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => payTable(selectedTableDetails, false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-4 rounded-xl font-bold text-sm transition-colors border border-slate-700">Solo Pagar</button>
                <button onClick={() => payTable(selectedTableDetails, true)} className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transform active:scale-95 transition-all"><Printer size={18}/> Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SETTINGS RÁPIDO --- */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-white flex items-center gap-2"><Settings size={20}/> Ajustes Rápido</h3><button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-white"><X/></button></div>
                <button onClick={() => { setSettingsOpen(false); setAdminTab('settings'); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">Ir a Configuración Completa</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;