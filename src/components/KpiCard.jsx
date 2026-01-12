// src/components/KpiCard.jsx
import React from 'react';

const KpiCard = ({ t, v, c, dark }) => {
  return (
    <div className={`p-3 rounded-xl border-l-4 shadow-sm ${dark ? 'bg-slate-800 border-slate-600 text-white' : `bg-white border-${c}-500`}`}>
      <div className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
        {t}
      </div>
      <div className={`text-lg md:text-xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>
        {typeof v === 'number' ? '$' + v.toLocaleString() : v}
      </div>
    </div>
  );
};

export default KpiCard;