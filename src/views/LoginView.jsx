import React from 'react';
import { Store } from 'lucide-react';

const LoginView = ({ 
  loginForm, 
  setLoginForm, 
  handleLogin, 
  isRegistering, 
  setIsRegistering, 
  authMsg 
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
        <Store size={40} className="mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-black text-slate-800 mb-2">Gastro-Link</h1>
        <p className="text-slate-500 mb-6 text-sm">Acceso a Plataforma</p>
        
        <form onSubmit={handleLogin} className="space-y-3">
          <input 
            value={loginForm.id} 
            onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} 
            className="w-full bg-slate-100 p-3 rounded font-bold uppercase outline-none" 
            placeholder="ID EMPRESA" 
          />
          <input 
            type="password" 
            value={loginForm.pass} 
            onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })} 
            className="w-full bg-slate-100 p-3 rounded outline-none" 
            placeholder="CONTRASEÑA" 
          />
          
          {authMsg.text && (
            <p className="text-red-500 text-xs">{authMsg.text}</p>
          )}
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded font-bold">
            {isRegistering ? "REGISTRAR" : "INGRESAR"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="mt-4 text-xs text-blue-500 underline"
        >
          {isRegistering ? "Ya tengo cuenta" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
};

export default LoginView;