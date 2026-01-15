import React, { useState } from 'react';
import { Shield, Server, Activity, LogOut, Search, Building2, DollarSign, TrendingUp, X, Eye, Lock } from 'lucide-react';
import KpiCard from '../components/KpiCard';

const SuperAdminView = ({ allCompanies, globalStats, confirmLogout, auditCompany, auditData, setAuditData }) => {
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = allCompanies.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 selection:bg-purple-500/30">
      
      {/* --- HEADER GOD MODE --- */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-900/50 animate-pulse">
             <Shield className="text-white" size={32}/>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">MASTER CONTROL</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sistema Operativo • V 2.0</p>
            </div>
          </div>
        </div>
        <button onClick={confirmLogout} className="bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-transparent hover:border-red-500/50">
          <LogOut size={20}/> <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- GLOBAL STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-blue-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Empresas Activas</p>
                <h3 className="text-4xl font-black text-white">{allCompanies.length}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400"><Server size={24}/></div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-green-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Transacciones Globales</p>
                <h3 className="text-4xl font-black text-white">{globalStats.totalOrders}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl text-green-400"><Activity size={24}/></div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] bg-purple-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Volumen Total (Est)</p>
                <h3 className="text-4xl font-black text-white">${globalStats.totalRevenue?.toLocaleString()}</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400"><DollarSign size={24}/></div>
           </div>
        </div>

        {/* --- LISTA DE EMPRESAS --- */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl">
           <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 <Building2 className="text-slate-500"/> Tenants (Clientes)
              </h2>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-3.5 text-slate-500" size={20}/>
                 <input 
                   type="text" 
                   placeholder="Buscar empresa por ID..." 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(comp => (
                <div key={comp.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all group hover:shadow-lg hover:shadow-purple-900/10">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="font-bold text-white text-lg">{comp.id}</h3>
                         <p className="text-xs text-slate-500 font-mono mt-1">Pass: {comp.pass}</p>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg text-slate-600 group-hover:text-purple-400 transition-colors">
                         <Server size={20}/>
                      </div>
                   </div>
                   <div className="flex gap-2 mt-4 pt-4 border-t border-slate-900">
                      <button 
                        onClick={() => auditCompany(comp.id)}
                        className="flex-1 bg-slate-900 hover:bg-purple-600 hover:text-white text-slate-400 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                         <Eye size={16}/> Auditar
                      </button>
                   </div>
                </div>
              ))}
              {filteredCompanies.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-600 italic">
                   No se encontraron empresas activas.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* --- MODAL AUDITORÍA (Inteligencia) --- */}
      {auditData && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl p-8 animate-in zoom-in-95 relative overflow-hidden">
              
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                       <Lock className="text-purple-500" size={28}/> Reporte Confidencial
                    </h2>
                    <p className="text-slate-400 mt-1 uppercase tracking-widest font-bold text-xs">Objetivo: {auditData.id}</p>
                 </div>
                 <button onClick={() => setAuditData(null)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <X size={24}/>
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                 <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-500 text-xs uppercase font-bold mb-2">Ingresos Totales</p>
                    <p className="text-2xl font-black text-green-400">${auditData.sales?.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-500 text-xs uppercase font-bold mb-2">Gastos Operativos</p>
                    <p className="text-2xl font-black text-red-400">${auditData.expenses?.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 col-span-2 flex justify-between items-center">
                    <div>
                       <p className="text-slate-500 text-xs uppercase font-bold mb-1">Producto Estrella</p>
                       <p className="text-xl font-bold text-white">{auditData.topProduct}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-500 text-xs uppercase font-bold mb-1">Volumen Pedidos</p>
                       <p className="text-xl font-bold text-white">#{auditData.orderCount}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center relative z-10">
                 <span className="font-bold text-slate-400">Ganancia Neta Calculada</span>
                 <span className={`text-3xl font-black ${auditData.profit >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                    ${auditData.profit?.toLocaleString()}
                 </span>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminView;