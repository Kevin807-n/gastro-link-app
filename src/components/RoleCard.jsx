import React from 'react';

// Este componente recibe el Icono como una propiedad (prop) llamada 'icon'
const RoleCard = ({ icon: Icon, title, color, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className={`bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-${color}-500 transition-all flex flex-col items-center gap-3 w-full hover:shadow-lg group`}
    >
      <Icon size={40} className={`text-${color}-500 group-hover:scale-110 transition-transform`} />
      <span className="font-bold text-xl text-slate-700">{title}</span>
    </button>
  );
};

export default RoleCard;