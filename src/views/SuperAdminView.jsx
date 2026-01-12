import React from 'react';
import { ShieldCheck } from 'lucide-react';
import KpiCard from '../components/KpiCard';

const SuperAdminView = ({ 
  allCompanies, 
  globalStats, 
  confirmLogout, 
  auditCompany, 
  auditData, 
  setAuditData 
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      
      {/* HEADER MASTER */}
      <header className="flex justify-between mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-2xl font-bold flex gap-2 items-center">
          <ShieldCheck className="text-yellow-500" /> MASTER
        </h1>
        <button 
          onClick={confirmLogout} 
          className="bg-red-600 px-4 py-2 rounded text-sm font-bold hover:bg-red-500"
        >
          Salir
        </button>
      </header>

      {/* KPIS GLOBALES */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <KpiCard t="Empresas" v={allCompanies.length} c="blue" dark />
        <KpiCard t="Global" v={globalStats.totalRevenue} c="green" dark />
      </div>

      {/* LISTA DE CLIENTES (EMPRESAS) */}
      <div className="bg-slate-800 rounded p-4">
        <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">Clientes Registrados</h3>
        {allCompanies.map(c => (
          <div key={c.id} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
            <span>{c.id}</span>
            <button 
              onClick={() => auditCompany(c.id)} 
              className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500"
            >
              Auditar
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE AUDITORÍA */}
      {auditData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-800 p-6 rounded w-full max-w-sm border border-slate-600 shadow-2xl">
            <h3 className="font-bold mb-4 text-yellow-400 text-xl">Auditoría: {auditData.id}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ventas</span>
                <span className="text-green-400">${auditData.sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos</span>
                <span className="text-red-400">${auditData.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 border-slate-600">
                <span>Ganancia</span>
                <span className="text-white">${auditData.profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Pedidos</span>
                <span>{auditData.orderCount}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600 text-center">
                <div className="text-xs text-slate-400 uppercase">Más Vendido</div>
                <div className="font-bold text-lg text-blue-400">{auditData.topProduct}</div>
              </div>
            </div>

            <button 
              onClick={() => setAuditData(null)} 
              className="w-full bg-slate-600 mt-6 py-2 rounded font-bold hover:bg-slate-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminView;