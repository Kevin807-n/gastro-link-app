import React from 'react';
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';

const KpiCard = ({ t, v, c, dark = false }) => {
  // Configuración de colores según el tema (Dark vs Light)
  const colors = {
    green: dark ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-green-600 bg-green-50 border-green-100',
    red: dark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100',
    blue: dark ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-blue-600 bg-blue-50 border-blue-100'
  };

  const icons = {
    green: <TrendingUp size={20}/>,
    red: <Wallet size={20}/>,
    blue: <DollarSign size={20}/>
  };

  const activeColor = colors[c] || colors.blue;

  return (
    <div className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border p-5 rounded-2xl shadow-sm flex items-center justify-between`}>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{t}</p>
        <h3 className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>
            ${v?.toLocaleString() || '0'}
        </h3>
      </div>
      <div className={`p-3 rounded-xl border ${activeColor}`}>
        {icons[c]}
      </div>
    </div>
  );
};

export default KpiCard;