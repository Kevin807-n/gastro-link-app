import React from 'react';
import { ChefHat, ArrowRight, UserPlus, LogIn, Store, Lock, AlertCircle } from 'lucide-react';

const LoginView = ({ loginForm, setLoginForm, handleLogin, isRegistering, setIsRegistering, authMsg }) => {
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* 1. FONDO ANIMADO (LUCES DE FONDO) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>

      {/* 2. TARJETA PRINCIPAL (EFECTO VIDRIO) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-full max-w-5xl h-[650px] md:h-[600px] rounded-3xl shadow-2xl flex overflow-hidden relative z-10">
        
        {/* LADO IZQUIERDO: IMAGEN Y BRANDING (Solo visible en PC) */}
        <div className="hidden md:flex flex-1 relative flex-col justify-end p-12 text-white">
          <div className="absolute inset-0">
             {/* Imagen de fondo de alta calidad */}
             <img 
               src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
               alt="Restaurant Vibe" 
               className="w-full h-full object-cover opacity-50"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 w-fit p-3 rounded-2xl mb-2">
               <ChefHat size={32} className="text-blue-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Gestiona tu restaurante <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">como un experto.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm">
              Control de stock, comandas en tiempo real y métricas financieras. Todo en un solo lugar.
            </p>
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="flex-1 bg-slate-950/50 flex flex-col justify-center p-8 md:p-12 relative">
          
          <div className="max-w-sm mx-auto w-full space-y-8">
            
            {/* Header del Formulario */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isRegistering ? 'Únete a GastroLink' : 'Bienvenido de nuevo'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isRegistering ? 'Crea tu cuenta empresarial en segundos' : 'Ingresa tus credenciales para continuar'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Input ID Empresa */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">ID Empresa</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: BURGER-KING"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    value={loginForm.id}
                    onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña Maestra</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    value={loginForm.pass}
                    onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
                  />
                </div>
              </div>

              {/* Mensajes de Error/Éxito */}
              {authMsg.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 ${authMsg.type === 'err' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                  <AlertCircle size={18} />
                  {authMsg.text}
                </div>
              )}

              {/* Botón Principal (Con gradiente y sombra) */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 group"
              >
                {isRegistering ? (
                  <>Crear Cuenta <UserPlus size={20} className="group-hover:translate-x-1 transition-transform"/></>
                ) : (
                  <>Iniciar Sesión <LogIn size={20} className="group-hover:translate-x-1 transition-transform"/></>
                )}
              </button>
            </form>

            {/* Switch Login/Register */}
            <div className="pt-6 text-center border-t border-slate-800/50">
              <p className="text-slate-500 mb-3 text-xs">
                {isRegistering ? '¿Ya tienes una cuenta?' : '¿Nuevo en GastroLink?'}
              </p>
              <button
                onClick={() => { setIsRegistering(!isRegistering); setAuthMsg({type:'', text:''}); }}
                className="text-white font-bold text-sm flex items-center justify-center gap-2 mx-auto hover:text-blue-400 transition-colors"
              >
                {isRegistering ? 'Ir al Login' : 'Crear una Empresa'} <ArrowRight size={16}/>
              </button>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-slate-600 text-[10px] text-center w-full uppercase tracking-widest opacity-50">
        © 2026 GastroLink System
      </div>
    </div>
  );
};

export default LoginView;