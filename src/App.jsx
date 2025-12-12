import React, { useState, useEffect } from 'react';

import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import { 
  collection, addDoc, updateDoc, doc, query, where, orderBy, 
  onSnapshot, serverTimestamp, writeBatch, setDoc, deleteDoc, getDoc, limit 
} from 'firebase/firestore';
import { 
  ChefHat, Utensils, Bell, User, Trash2, PlusCircle, DollarSign, Monitor, 
  FileText, X, Lock, Power, TrendingUp, TrendingDown, Wallet, LogOut, 
  Award, Store, ArrowRight, KeyRound, Receipt, Save, RefreshCw, ShoppingCart, List,
  ShieldCheck, Printer, Search, Settings, MapPin, Phone, Star, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

// --- DATOS GLOBALES ---
const PINS = { admin: "1234", kitchen: "5555", waiter: "0000" };
const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CATEGORIES = ["Fuertes", "Entradas", "Bebidas", "Postres", "Otros"];
const appId = "gastro-link-pro-v1";

export default function App() {
  const [user, setUser] = useState(null);

  // --- SESIÓN ---
  const [company, setCompany] = useState(null); 
  const [companySettings, setCompanySettings] = useState({}); 
  const [role, setRole] = useState(null); 
  const [waiterName, setWaiterName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); 
  
  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ id: "", pass: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' });
  
  // Datos
  const [storeStatus, setStoreStatus] = useState('open');
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [myReadyOrders, setMyReadyOrders] = useState([]); 
  const [expenses, setExpenses] = useState([]);
  const [waiterStats, setWaiterStats] = useState({});
  const [salesTotal, setSalesTotal] = useState(0);

  // Super Admin
  const [allCompanies, setAllCompanies] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const [globalStats, setGlobalStats] = useState({ totalOrders: 0, totalRevenue: 0 });

  // Modales UI
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(null);
  const [pinInput, setPinInput] = useState("");
  
  // Estados Vistas
  const [waiterView, setWaiterView] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState("Fuertes");
  const [cart, setCart] = useState([]);
  const [tableNum, setTableNum] = useState("");
  const [itemToCustomize, setItemToCustomize] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [adminTab, setAdminTab] = useState('pos');
  const [newItemForm, setNewItemForm] = useState({ name: "", price: "", category: "Fuertes" });
  const [newExpense, setNewExpense] = useState({ desc: "", amount: "" });
  const [settingsForm, setSettingsForm] = useState({ nit: "", address: "", phone: "", footer: "", logoUrl: "" });
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);

  // --- FUNCIONES CLAVE ---
  
  const requestLogout = () => {
     setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
     localStorage.removeItem('gl_company_id');
     localStorage.removeItem('gl_role');
     localStorage.removeItem('gl_waiter_name');
     
     setCompany(null); 
     setRole(null); 
     setWaiterName(""); 
     setIsSuperAdmin(false); 
     setLogoutConfirmOpen(false); 
     setLoginForm({id: "", pass: ""});
     setAuditData(null);
     // Recarga forzada para limpiar memoria
     window.location.reload(); 
  };

  const exitRole = () => {
      localStorage.removeItem('gl_role');
      window.location.reload(); 
  };

  // 1. INICIO
  useEffect(() => {
    const initAuth = async () => {
      const savedCompany = localStorage.getItem('gl_company_id');
      const savedRole = localStorage.getItem('gl_role');
      const savedName = localStorage.getItem('gl_waiter_name');

      if (savedCompany && savedCompany !== 'MASTER') {
         setCompany({ id: savedCompany });
         if (savedRole) setRole(savedRole);
         if (savedName) setWaiterName(savedName);
      } else if (savedCompany === 'MASTER') {
         setIsSuperAdmin(true);
      }

      // Autenticación Real
      try {
          // Ajuste para entorno de chat: usar token si existe
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(auth, __initial_auth_token);
          } else {
              await signInAnonymously(auth);
          }
      } catch (error) {
          console.error("Error conectando a Firebase:", error);
      }
      setIsLoading(false);
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 2. LISTENERS
  useEffect(() => {
    if (!user) return;

    if (isSuperAdmin) {
       const qComps = query(collection(db, 'gl_companies'));
       const unsubComps = onSnapshot(qComps, (snap) => setAllCompanies(snap.docs.map(d => ({id: d.id, ...d.data()}))));
       
       const qGlobal = query(collection(db, 'gl_orders'), limit(500));
       const unsubGlobal = onSnapshot(qGlobal, (snap) => {
          let c = 0; let m = 0;
          snap.docs.forEach(d => { c++; m += d.data().total || 0; });
          setGlobalStats({ totalOrders: c, totalRevenue: m });
       });
       return () => { unsubComps(); unsubGlobal(); };
    }

    if (!company) return;

    const unsubSettings = onSnapshot(doc(db, 'gl_settings', company.id), (snap) => {
        if(snap.exists()) { setCompanySettings(snap.data()); setSettingsForm(snap.data()); }
    });

    const storeRef = doc(db, 'gl_stores', company.id);
    const unsubStore = onSnapshot(storeRef, (snap) => {
       if (snap.exists()) setStoreStatus(snap.data().status);
       else setDoc(storeRef, { status: 'open', createdAt: serverTimestamp() });
    });

    const unsubMenu = onSnapshot(query(collection(db, 'gl_menus'), where('companyId', '==', company.id)), (snap) => {
       setMenuItems(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'gl_orders'), where('companyId', '==', company.id)), (snap) => {
       const all = snap.docs.map(d => ({id: d.id, ...d.data()}));
       const active = all.filter(o => o.status !== 'paid').sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
       setActiveOrders(active);
       if(role==='waiter') setMyReadyOrders(active.filter(o => o.waiterId === user.uid && o.status === 'ready'));
       
       if(role==='admin') {
          const paid = all.filter(o => o.status === 'paid');
          let t = 0; let ws = {};
          paid.forEach(d => { t += d.total; ws[d.waiterName||"Anon"] = (ws[d.waiterName||"Anon"]||0)+d.total; });
          setSalesTotal(t); setWaiterStats(ws);
       }
    });

    let unsubExp = () => {};
    if(role==='admin') {
        unsubExp = onSnapshot(query(collection(db, 'gl_expenses'), where('companyId', '==', company.id)), (s) => {
            setExpenses(s.docs.map(d => ({id:d.id, ...d.data()})));
        });
    }

    return () => { unsubSettings(); unsubStore(); unsubOrders(); unsubMenu(); unsubExp(); };
  }, [user, company, role, isSuperAdmin]);

  // --- EFECTO DE SONIDO ---
  // Guardamos cuántos pedidos había antes para saber si llegaron nuevos
  const [prevOrderCount, setPrevOrderCount] = useState(0);

  useEffect(() => {
    // Si no hay pedidos cargados, no hacemos nada
    if (activeOrders.length === 0) {
       setPrevOrderCount(0);
       return;
    }

    // 1. SONIDO PARA COCINA (Ding-Dong cuando entran pedidos nuevos)
    if (role === 'kitchen' && activeOrders.length > prevOrderCount) {
        // Solo suena si hay pedidos PENDIENTES nuevos
        const hasPending = activeOrders.some(o => o.status === 'pending');
        if (hasPending) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a');
            audio.play().catch(e => console.log("Click en la pantalla para activar sonido"));
        }
    }

    // 2. SONIDO PARA MESERO (Campana cuando un pedido está LISTO)
    if (role === 'waiter') {
        // Si tengo pedidos míos que acaban de pasar a 'ready'
        const myReady = activeOrders.filter(o => o.waiterId === user.uid && o.status === 'ready');
        // Si hay algun pedido listo que NO estaba listo antes (simplificado: si hay algun ready)
        if (myReady.length > 0 && myReady.length > myReadyOrders.length) {
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a');
             audio.play().catch(e => console.log("Click para sonido"));
        }
    }

    // Actualizamos el contador para la próxima vez
    setPrevOrderCount(activeOrders.length);
  }, [activeOrders, role, user]);

  // 3. LOGICA
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMsg({type:'', text:''});
    const cid = loginForm.id.trim().toUpperCase();
    
    if (cid === 'MASTER' && loginForm.pass === 'admin123') {
       localStorage.setItem('gl_company_id', 'MASTER');
       setIsSuperAdmin(true); return;
    }
    if (cid.length < 3) return setAuthMsg({type:'err', text:'ID corto'});
    
    const ref = doc(db, 'gl_companies', cid);
    const snap = await getDoc(ref);

    if (isRegistering) {
       if (snap.exists()) return setAuthMsg({type:'err', text:'Empresa ya existe'});
       await setDoc(ref, { pass: loginForm.pass, created: serverTimestamp() });
       success(cid);
    } else {
       if (!snap.exists()) return setAuthMsg({type:'err', text:'No existe'});
       if (snap.data().pass !== loginForm.pass) return setAuthMsg({type:'err', text:'Clave mal'});
       success(cid);
    }
  };

  const success = (cid) => { localStorage.setItem('gl_company_id', cid); setCompany({ id: cid }); };

  const handleRoleAuth = () => {
     if (PINS[targetRole] === pinInput) {
        if(targetRole === 'waiter' && !waiterName) {
           const n = prompt("Tu nombre:");
           if(n) { setWaiterName(n); localStorage.setItem('gl_waiter_name', n); }
        }
        setRole(targetRole); localStorage.setItem('gl_role', targetRole); setIsPinModalOpen(false); setPinInput("");
     } else { alert("PIN Incorrecto"); setPinInput(""); }
  };

  // --- OPERATIVA ---
  const auditCompany = async (cid) => {
     const qO = query(collection(db, 'gl_orders'), where('companyId', '==', cid));
     const qE = query(collection(db, 'gl_expenses'), where('companyId', '==', cid));
     
     const [snapO, snapE] = await Promise.all([
         new Promise(resolve => { const u = onSnapshot(qO, (s) => { u(); resolve(s); }); }),
         new Promise(resolve => { const u = onSnapshot(qE, (s) => { u(); resolve(s); }); })
     ]);

     let sales = 0; let expenses = 0; let count = 0;
     let itemsCount = {};

     snapO.docs.forEach(d => { 
         if(d.data().status === 'paid') { 
             sales += d.data().total; 
             count++; 
             if(Array.isArray(d.data().items)) {
                d.data().items.forEach(item => {
                    itemsCount[item.name] = (itemsCount[item.name] || 0) + 1;
                });
             }
         } 
     });
     snapE.docs.forEach(d => { expenses += d.data().amount; });

     const topProduct = Object.entries(itemsCount).sort((a,b) => b[1] - a[1])[0];

     setAuditData({ 
         id: cid, 
         sales, 
         expenses, 
         profit: sales - expenses, 
         topProduct: topProduct ? `${topProduct[0]} (${topProduct[1]})` : "Ninguno",
         orderCount: count
     });
  };

  const sendOrder = async () => {
    if (!tableNum || cart.length === 0) return alert("Faltan datos");
    const tc = [...cart]; setCart([]); setTableNum("");
    await addDoc(collection(db, 'gl_orders'), {
       companyId: company.id, waiterId: user.uid, waiterName: waiterName,
       table: parseInt(tableNum), items: tc, status: 'pending',
       total: tc.reduce((a,b)=>a+b.price,0), createdAt: serverTimestamp()
    });
  };

  const updateStatus = async (oid, st) => {
     setActiveOrders(prev => prev.map(o => o.id === oid ? { ...o, status: st } : o));
     if(role==='waiter' && st==='delivered') setMyReadyOrders(prev => prev.filter(o => o.id !== oid));
     await updateDoc(doc(db, 'gl_orders', oid), { status: st });
  };

  const printReceipt = (items, total, table) => {
      const win = window.open('', '', 'width=300,height=600');
      win.document.write(`
        <html>
            <head>
                <title>Ticket</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 10px; width: 100%; font-size: 12px; margin: 0; box-sizing: border-box; }
                    .center { text-align: center; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .bold { font-weight: bold; }
                    img { max-width: 80px; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="center">
                    ${companySettings.logoUrl ? `<img src="${companySettings.logoUrl}" />` : ''}
                    <h3 style="margin:0">${company.id}</h3>
                    <p>${companySettings.nit||''}</p>
                    <p>${companySettings.address||''}</p>
                    <p>Mesa: ${table} | ${new Date().toLocaleTimeString()}</p>
                </div>
                <div class="line"></div>
                ${items.map(i => `<div class="row"><span>${i.name}</span><span>$${i.price.toLocaleString()}</span></div>`).join('')}
                <div class="line"></div>
                <div class="row bold" style="font-size:16px;"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
                <div class="center" style="margin-top:20px;">
                    <p>${companySettings.footer||'Gracias por su compra'}</p>
                </div>
            </body>
        </html>
      `);
      win.document.close();
      setTimeout(()=>win.print(), 500);
  };

  const payTable = async (tid, print) => {
     const toPay = activeOrders.filter(o => o.table === tid);
     const total = toPay.reduce((a,b)=>a+b.total,0);
     if(print) {
         const allItems = toPay.flatMap(o => o.items.map(i => ({...i, waiterName: o.waiterName})));
         printReceipt(allItems, total, tid);
     }
     const batch = writeBatch(db);
     toPay.forEach(o => batch.update(doc(db, 'gl_orders', o.id), { status: 'paid' }));
     await batch.commit();
     setSelectedTableDetails(null);
  };

  const addMenuItem = async () => {
     if(!newItemForm.name) return;
     await addDoc(collection(db, 'gl_menus'), { companyId: company.id, ...newItemForm, price: parseInt(newItemForm.price) });
     setNewItemForm({name:"", price:"", category:"Fuertes"});
  };
  const deleteMenuItem = async (id) => { if(confirm("¿Borrar?")) await deleteDoc(doc(db, 'gl_menus', id)); };
  
  const addExpense = async () => {
     if(!newExpense.desc) return;
     await addDoc(collection(db, 'gl_expenses'), { companyId: company.id, description: newExpense.desc, amount: parseInt(newExpense.amount), createdAt: serverTimestamp() });
     setNewExpense({desc:"", amount:""});
  };
  const deleteExpense = async (id) => await deleteDoc(doc(db, 'gl_expenses', id));

  const saveSettings = async () => {
      await setDoc(doc(db, 'gl_settings', company.id), settingsForm);
      setSettingsOpen(false); alert("Guardado");
  };

  // --- RENDER ---
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-900"><RefreshCw className="animate-spin text-blue-500" size={40}/></div>;

  // 0. MASTER
  if (isSuperAdmin) {
     return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
           <header className="flex justify-between mb-8 border-b border-slate-700 pb-4">
              <h1 className="text-2xl font-bold flex gap-2"><ShieldCheck className="text-yellow-500"/> MASTER</h1>
              <button onClick={confirmLogout} className="bg-red-600 px-4 py-2 rounded text-sm font-bold">Salir</button>
           </header>
           <div className="grid grid-cols-2 gap-4 mb-6"><KpiCard t="Empresas" v={allCompanies.length} c="blue" dark/><KpiCard t="Global" v={globalStats.totalRevenue} c="green" dark/></div>
           <div className="bg-slate-800 rounded p-4">
              <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">Clientes</h3>
              {allCompanies.map(c => (
                 <div key={c.id} className="flex justify-between py-2 border-b border-slate-700">
                    <span>{c.id}</span>
                    <button onClick={()=>auditCompany(c.id)} className="text-xs bg-blue-600 px-2 py-1 rounded">Auditar</button>
                 </div>
              ))}
           </div>
           {auditData && <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"><div className="bg-slate-800 p-6 rounded w-full max-w-sm border border-slate-600"><h3 className="font-bold mb-4 text-yellow-400 text-xl">Auditoría {auditData.id}</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Ventas</span><span className="text-green-400">${auditData.sales.toLocaleString()}</span></div><div className="flex justify-between"><span>Gastos</span><span className="text-red-400">${auditData.expenses.toLocaleString()}</span></div><div className="flex justify-between font-bold border-t pt-2 border-slate-600"><span>Ganancia</span><span className="text-white">${auditData.profit.toLocaleString()}</span></div><div className="flex justify-between"><span>Pedidos</span><span>{auditData.orderCount}</span></div><div className="mt-4 pt-4 border-t border-slate-600 text-center"><div className="text-xs text-slate-400 uppercase">Más Vendido</div><div className="font-bold text-lg text-blue-400">{auditData.topProduct}</div></div></div><button onClick={()=>setAuditData(null)} className="w-full bg-slate-600 mt-6 py-2 rounded font-bold hover:bg-slate-500">Cerrar</button></div></div>}
        </div>
     );
  }

  // 1. LOGIN
  if (!company) {
     return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
           <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
              <Store size={40} className="mx-auto text-blue-600 mb-4"/>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Gastro-Link</h1>
              <p className="text-slate-500 mb-6 text-sm">Acceso a Plataforma</p>
              <form onSubmit={handleLogin} className="space-y-3">
                 <input value={loginForm.id} onChange={e=>setLoginForm({...loginForm,id:e.target.value})} className="w-full bg-slate-100 p-3 rounded font-bold uppercase outline-none" placeholder="ID EMPRESA"/>
                 <input type="password" value={loginForm.pass} onChange={e=>setLoginForm({...loginForm,pass:e.target.value})} className="w-full bg-slate-100 p-3 rounded outline-none" placeholder="CONTRASEÑA"/>
                 {authMsg.text && <p className="text-red-500 text-xs">{authMsg.text}</p>}
                 <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded font-bold">{isRegistering?"REGISTRAR":"INGRESAR"}</button>
              </form>
              <button onClick={()=>setIsRegistering(!isRegistering)} className="mt-4 text-xs text-blue-500 underline">{isRegistering?"Ya tengo cuenta":"Crear cuenta"}</button>
           </div>
        </div>
     );
  }

  // 2. CLOSED
  if (storeStatus === 'closed' && role !== 'admin') {
     return <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center"><Lock size={60} className="text-red-500 mb-4"/><h1 className="text-4xl font-black">CERRADO</h1><button onClick={()=>{setTargetRole('admin');setIsPinModalOpen(true)}} className="mt-8 border px-4 py-1 rounded text-xs hover:bg-white hover:text-black transition-colors">Soy Admin</button>{isPinModalOpen && <div className="fixed inset-0 bg-black/90 flex items-center justify-center"><div className="bg-white p-6 rounded text-black"><input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} className="border p-2 mb-2 w-full text-center text-xl font-bold" autoFocus/><button onClick={handleRoleAuth} className="w-full bg-red-600 text-white py-2 rounded font-bold">Entrar</button><button onClick={()=>setIsPinModalOpen(false)} className="mt-2 w-full text-slate-500 text-sm">Cancelar</button></div></div>}</div>;
  }

  // 3. ROLE SELECT
  if (!role) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
           <div className="bg-white px-5 py-3 rounded-full shadow mb-8 flex items-center gap-3 w-full max-w-sm justify-between">
              <div className="flex items-center gap-2"><Store size={18} className="text-blue-600"/><span className="font-bold text-slate-700 uppercase">{company.id}</span></div>
              <button onClick={requestLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><LogOut size={18}/></button>
           </div>
           <h1 className="text-2xl font-black text-slate-800 mb-6 text-center">Selecciona Rol</h1>
           <div className="grid gap-4 w-full max-w-sm">
              <RoleCard icon={User} title="Mesero" color="blue" onClick={()=>{setTargetRole('waiter');setIsPinModalOpen(true)}}/>
              <RoleCard icon={ChefHat} title="Cocina" color="orange" onClick={()=>{setTargetRole('kitchen');setIsPinModalOpen(true)}}/>
              <RoleCard icon={Monitor} title="Gerencia" color="green" onClick={()=>{setTargetRole('admin');setIsPinModalOpen(true)}}/>
           </div>
           {isPinModalOpen && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl w-full max-w-xs text-center shadow-2xl"><h3 className="font-bold mb-4 text-xl">PIN {targetRole}</h3><input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} className="w-full bg-slate-100 p-4 rounded text-center text-3xl font-bold mb-4 outline-none" maxLength={4} autoFocus/><div className="flex gap-2"><button onClick={()=>setIsPinModalOpen(false)} className="flex-1 bg-slate-200 py-3 rounded font-bold text-slate-600">X</button><button onClick={handleRoleAuth} className="flex-1 bg-blue-600 text-white py-3 rounded font-bold shadow-lg">OK</button></div></div></div>}
           {logoutConfirmOpen && <LogoutModal onConfirm={confirmLogout} onCancel={()=>setLogoutConfirmOpen(false)}/>}
        </div>
     )
  }

  // --- VISTAS INTERNAS ---

  // ADMIN
  if (role === 'admin') {
     const netProfit = salesTotal - expenses.reduce((a,b)=>a+b.amount,0);
     return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
               <div className="flex items-center gap-2">
                  <Monitor className="text-green-600"/>
                  {/* AQUÍ ESTÁ LA MAGIA: Muestra el Nombre o el ID */}
                  <div className="flex flex-col">
                     <span className="font-black text-slate-800 text-lg uppercase leading-none">
                        {companySettings.name || company.id}
                     </span>
                     {companySettings.name && <span className="text-[10px] text-slate-400 font-bold tracking-widest">{company.id}</span>}
                  </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={()=>setSettingsOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"><Settings size={20}/></button>
                 <button onClick={async()=>{const n=storeStatus==='open'?'closed':'open';await updateDoc(doc(db,'gl_stores',company.id),{status:n})}} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${storeStatus==='open'?'bg-red-50 text-red-600 hover:bg-red-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}><Power size={14}/> {storeStatus==='open'?'CERRAR':'ABRIR'}</button>
                 <button onClick={exitRole} className="p-2 bg-slate-100 rounded-lg text-slate-500"><LogOut size={18}/></button>
               </div>
           </header>
           <div className="flex p-4 gap-2 overflow-x-auto">
              {['pos', 'menu', 'finance', 'settings'].map(t => (
                 <button key={t} onClick={()=>setAdminTab(t)} className={`flex-1 min-w-[100px] py-2 rounded-lg font-bold text-xs capitalize ${adminTab===t?'bg-slate-800 text-white shadow-lg':'bg-white text-slate-500 border border-slate-200'}`}>{t==='pos'?'Caja':t==='finance'?'Finanzas':t==='settings'?'Config':'Menú'}</button>
              ))}
           </div>

           <div className="px-4 animate-in slide-in-from-bottom-4">
              {adminTab === 'pos' && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TABLES.map(t => {
                       const tot = activeOrders.filter(o=>o.table===t).reduce((a,b)=>a+b.total,0);
                       return <button key={t} onClick={()=>tot>0?setSelectedTableDetails(t):null} className={`p-4 rounded-2xl border-2 h-28 flex flex-col items-center justify-center gap-1 transition-all ${tot>0?'bg-white border-red-500 shadow-md cursor-pointer':'bg-slate-100 border-dashed opacity-60 cursor-default'}`}><span className="font-black text-lg text-slate-700">MESA {t}</span>{tot>0?<span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">${tot.toLocaleString()}</span>:<span className="text-[10px] text-slate-400">Libre</span>}</button>
                    })}
                 </div>
              )}
              {adminTab === 'menu' && <div className="space-y-6"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-lg mb-4 text-slate-700">Nuevo Plato</h3><div className="flex flex-col md:flex-row gap-3"><input placeholder="Nombre" value={newItemForm.name} onChange={e=>setNewItemForm({...newItemForm,name:e.target.value})} className="w-full md:flex-[2] bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/><div className="flex gap-3 w-full md:flex-1"><input placeholder="Precio" type="number" value={newItemForm.price} onChange={e=>setNewItemForm({...newItemForm,price:e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/><select value={newItemForm.category} onChange={e=>setNewItemForm({...newItemForm,category:e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 bg-white">{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div><button onClick={addMenuItem} className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 md:py-2 rounded-xl font-bold flex items-center justify-center gap-2"><PlusCircle size={20}/><span className="md:hidden">Guardar</span><span className="hidden md:inline">Crear</span></button></div></div><div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">{menuItems.map(item => (<div key={item.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50"><div><span className="font-bold block text-slate-800">{item.name}</span><div className="flex items-center gap-2 mt-1"><span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase">{item.category}</span><span className="text-sm font-bold text-blue-600">${item.price.toLocaleString()}</span></div></div><button onClick={()=>deleteMenuItem(item.id)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={20}/></button></div>))}</div></div>}
              {adminTab === 'finance' && <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><KpiCard t="Ventas Históricas" v={salesTotal} c="green"/><KpiCard t="Gastos" v={expenses.reduce((a,b)=>a+b.amount,0)} c="red"/><KpiCard t="Ganancia Neta" v={netProfit} c="blue"/></div><div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700 mb-4 text-lg">Ranking Meseros</h3>{Object.entries(waiterStats).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>(<div key={n} className="flex justify-between items-center border-b border-slate-50 py-3 last:border-0"><div className="flex items-center gap-3"><span className="font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">#{i+1}</span><span className="font-medium text-slate-700">{n}</span></div><span className="font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">${v.toLocaleString()}</span></div>))}</div><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700 mb-4 text-lg">Registrar Gasto</h3><div className="flex flex-col md:flex-row gap-3 mb-6"><input placeholder="Motivo" value={newExpense.desc} onChange={e=>setNewExpense({...newExpense,desc:e.target.value})} className="w-full md:flex-[2] border border-slate-200 bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-500"/><div className="flex gap-3 w-full md:flex-1"><input type="number" placeholder="$" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-500"/><button onClick={addExpense} className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center"><PlusCircle size={24}/></button></div></div><div className="max-h-60 overflow-y-auto space-y-2 pr-2">{expenses.map(e=>(<div key={e.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 hover:bg-slate-50 p-2 rounded-lg group"><span className="text-slate-600 font-medium">{e.description}</span><div className="flex items-center gap-3"><span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">-${e.amount.toLocaleString()}</span><button onClick={()=>deleteExpense(e.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div></div>))}</div></div></div>}
              {adminTab === 'settings' && <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5 border border-slate-100"><h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Settings className="text-blue-600"/> Datos del Negocio</h3><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Visible del Restaurante</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 mt-1" placeholder="Ej: Pizzería Don Pepe" value={settingsForm.name || ''} onChange={e=>setSettingsForm({...settingsForm, name:e.target.value})}/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">NIT / Documento</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.nit} onChange={e=>setSettingsForm({...settingsForm, nit:e.target.value})}/></div><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.phone} onChange={e=>setSettingsForm({...settingsForm, phone:e.target.value})}/></div></div><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" value={settingsForm.address} onChange={e=>setSettingsForm({...settingsForm, address:e.target.value})}/></div><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensaje Ticket (Pie de página)</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1" placeholder="¡Gracias por su visita!" value={settingsForm.footer} onChange={e=>setSettingsForm({...settingsForm, footer:e.target.value})}/></div><div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo URL (Opcional)</label><input className="w-full bg-slate-50 p-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500 mt-1 text-slate-400" placeholder="https://..." value={settingsForm.logoUrl} onChange={e=>setSettingsForm({...settingsForm, logoUrl:e.target.value})}/></div><button onClick={saveSettings} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"><Save size={20}/> Guardar Configuración</button></div>}
           </div>
           
           {selectedTableDetails && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95"><div className="flex justify-between items-center mb-4"><h3 className="font-black text-xl text-slate-800">Mesa {selectedTableDetails}</h3><button onClick={()=>setSelectedTableDetails(null)}><X/></button></div><div className="max-h-48 overflow-y-auto mb-4 space-y-2">{activeOrders.filter(o=>o.table===selectedTableDetails).flatMap(o=>o.items).map((it,i)=>(<div key={i} className="flex justify-between text-xs border-b border-slate-100 pb-1"><span>{it.name}</span><span>${it.price.toLocaleString()}</span></div>))}</div><div className="flex justify-between font-black text-lg mb-4 pt-2 border-t"><span>TOTAL</span><span className="text-green-600">${activeOrders.filter(o=>o.table===selectedTableDetails).reduce((a,b)=>a+b.total,0).toLocaleString()}</span></div><div className="grid grid-cols-2 gap-2"><button onClick={()=>payTable(selectedTableDetails, false)} className="bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm">Solo Pagar</button><button onClick={()=>payTable(selectedTableDetails, true)} className="bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1"><Printer size={16}/> Imprimir</button></div></div></div>}
           {settingsOpen && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Settings size={20}/> Configuración</h3><button onClick={()=>setSettingsOpen(false)}><X/></button></div><div className="space-y-4"><div><label className="text-[10px] font-bold text-slate-400 uppercase">NIT / RUT</label><input className="w-full bg-slate-50 p-3 rounded-xl border outline-none text-sm" value={settingsForm.nit} onChange={e=>setSettingsForm({...settingsForm, nit:e.target.value})}/></div><div><label className="text-[10px] font-bold text-slate-400 uppercase">Dirección</label><input className="w-full bg-slate-50 p-3 rounded-xl border outline-none text-sm" value={settingsForm.address} onChange={e=>setSettingsForm({...settingsForm, address:e.target.value})}/></div><div><label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label><input className="w-full bg-slate-50 p-3 rounded-xl border outline-none text-sm" value={settingsForm.phone} onChange={e=>setSettingsForm({...settingsForm, phone:e.target.value})}/></div><div><label className="text-[10px] font-bold text-slate-400 uppercase">URL Logo (Opcional)</label><input className="w-full bg-slate-50 p-3 rounded-xl border outline-none text-sm" placeholder="https://..." value={settingsForm.logoUrl} onChange={e=>setSettingsForm({...settingsForm, logoUrl:e.target.value})}/></div><div><label className="text-[10px] font-bold text-slate-400 uppercase">Pie de Página</label><input className="w-full bg-slate-50 p-3 rounded-xl border outline-none text-sm" placeholder="¡Vuelva pronto!" value={settingsForm.footer} onChange={e=>setSettingsForm({...settingsForm, footer:e.target.value})}/></div><button onClick={saveSettings} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg mt-2">Guardar Cambios</button></div></div></div>}
        </div>
     )
  }

  // 5. KITCHEN
  if (role === 'kitchen') {
      return (
         <div className="p-4 bg-slate-900 min-h-screen text-white font-sans">
            <header className="flex justify-between items-center mb-6 border-b border-white/10 pb-4"><h1 className="font-bold flex gap-2 text-xl items-center"><ChefHat className="text-orange-500"/> Cocina <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{company.id}</span></h1><button onClick={exitRole} className="text-sm opacity-60 hover:opacity-100">Salir</button></header>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">{activeOrders.filter(o=>o.status!=='delivered').length===0 && <div className="col-span-full text-center py-20 text-slate-600"><ChefHat size={64} className="mx-auto mb-4 opacity-50"/><p className="text-xl font-bold">Todo limpio, Chef.</p></div>}{activeOrders.filter(o=>o.status!=='delivered').map(o=>(<div key={o.id} className={`p-4 rounded-xl border-l-4 shadow-lg flex flex-col ${o.status==='ready'?'border-green-500 bg-green-900/20':'border-orange-500 bg-slate-800'}`}><div className="flex justify-between mb-2 items-start"><span className="font-bold text-xl">Mesa {o.table}</span><span className="text-[10px] bg-slate-700 px-2 py-1 rounded uppercase tracking-widest">{o.status}</span></div><ul className="text-sm space-y-2 mb-4 flex-1">{o.items.map((it,i)=><li key={i} className="border-b border-white/5 pb-1 text-slate-300">{it.name} {it.note&&<span className="block text-orange-400 text-xs font-bold mt-1">⚠️ {it.note}</span>}</li>)}</ul>{o.status==='pending'&&<button onClick={()=>updateStatus(o.id,'cooking')} className="w-full bg-orange-600 py-3 rounded-lg font-bold">Empezar</button>}{o.status==='cooking'&&<button onClick={()=>updateStatus(o.id,'ready')} className="w-full bg-green-600 py-3 rounded-lg font-bold">¡LISTO!</button>}{o.status==='ready'&&<div className="text-center text-green-500 font-bold text-sm animate-pulse">Esperando entrega...</div>}</div>))}</div>
         </div>
      )
  }

  // 6. MESERO
  return (
      <div className="p-4 bg-white min-h-screen pb-24 font-sans relative">
          {myReadyOrders.length > 0 && <div className="fixed top-16 left-4 right-4 z-50 space-y-2 pointer-events-none">{myReadyOrders.map(o=><div key={o.id} className="bg-green-600 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center pointer-events-auto"><span className="font-bold">🔔 Mesa {o.table} LISTA</span><button onClick={(e)=>{e.stopPropagation(); updateStatus(o.id,'delivered')}} className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold">Entregar</button></div>)}</div>}
          <header className="flex justify-between items-center mb-4 bg-white sticky top-0 z-10 py-2 shadow-sm px-2 -mx-2"><div><h1 className="font-black flex items-center gap-2 text-xl text-slate-800 tracking-tight"><User className="text-blue-600" /> {waiterName}</h1><div className="flex items-center gap-2"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{companySettings.name || company.id}</span><span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span></div></div><button onClick={exitRole} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><LogOut size={20} /></button></header>
          {waiterView === 'menu' ? (<><div className="flex gap-2 overflow-x-auto mb-4 scrollbar-hide py-1">{TABLES.map(t=><button key={t} onClick={()=>setTableNum(t)} className={`px-4 py-3 rounded-xl border font-black text-lg transition-all ${tableNum===t?'bg-slate-800 text-white shadow-lg scale-105':'bg-white text-slate-300'}`}>{t}</button>)}</div><div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">{CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory===c?'bg-blue-600 text-white':'bg-slate-100 text-slate-500'}`}>{c}</button>)}</div><div className="grid gap-3 pb-20">{menuItems.filter(i=>selectedCategory==='Todos'||i.category===selectedCategory).map(i=>(<div key={i.id} onClick={()=>{setItemToCustomize(i)}} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center active:bg-blue-50 transition-colors shadow-sm cursor-pointer bg-white"><div><div className="font-bold text-slate-700">{i.name}</div><div className="text-blue-600 font-bold text-sm">${i.price.toLocaleString()}</div></div><PlusCircle size={24} className="text-blue-400"/></div>))} {menuItems.length===0 && <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-sm">Menú vacío.</div>}</div></>) : (<div className="grid grid-cols-1 gap-3">{TABLES.map(t=>{const tot=activeOrders.filter(o=>o.table===t).reduce((a,b)=>a+b.total,0);if(tot===0)return null;return <div key={t} className="bg-white border p-4 rounded-xl border-l-4 border-blue-500 shadow-sm"><div className="flex justify-between font-black text-xl mb-2 text-slate-800"><span>Mesa {t}</span><span>${tot.toLocaleString()}</span></div><div className="text-xs bg-slate-100 p-2 rounded text-slate-500 text-center font-bold">Pendiente de pago</div></div>})}{activeOrders.length===0 && <p className="text-center text-slate-400 mt-10 italic text-sm">Sin cuentas activas.</p>}</div>)}
          {cart.length>0 && waiterView==='menu' && <div className="fixed bottom-24 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-40 flex justify-between items-center"><div><div className="font-bold">Mesa {tableNum||"?"} • {cart.length}</div><div className="text-xs opacity-60">${cart.reduce((a,b)=>a+b.price,0).toLocaleString()}</div></div><button onClick={sendOrder} className="bg-blue-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">ENVIAR <ArrowRight/></button></div>}
          <div className="fixed bottom-0 w-full bg-white border-t p-2 flex justify-around z-50 pb-6 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]"><button onClick={()=>setWaiterView('menu')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${waiterView==='menu'?'text-blue-600 bg-blue-50':'text-slate-300'}`}><Utensils size={24}/><span className="text-[10px] font-bold">PEDIR</span></button><button onClick={()=>setWaiterView('bills')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${waiterView==='bills'?'text-blue-600 bg-blue-50':'text-slate-300'}`}><Receipt size={24}/><span className="text-[10px] font-bold">CUENTAS</span></button></div>
          {itemToCustomize && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95"><h3 className="font-bold mb-2 text-lg text-slate-800">{itemToCustomize.name}</h3><textarea autoFocus value={tempNote} onChange={e=>setTempNote(e.target.value)} className="w-full border p-3 rounded-xl mb-4 bg-slate-50 outline-none h-24" placeholder="Ej: Sin cebolla..."/><div className="flex gap-3"><button onClick={()=>{setItemToCustomize(null);setTempNote("")}} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500">Cancelar</button><button onClick={()=>{setCart([...cart,{...itemToCustomize,note:tempNote.trim(),cid:Math.random()}]);setItemToCustomize(null);setTempNote("")}} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Agregar</button></div></div></div>}
      </div>
  );
}

const RoleCard = ({icon:I, title, color, onClick}) => (<button onClick={onClick} className={`bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-${color}-500 transition-all flex flex-col items-center gap-3 w-full hover:shadow-lg group`}><I size={40} className={`text-${color}-500 group-hover:scale-110 transition-transform`}/><span className="font-bold text-xl text-slate-700">{title}</span></button>);
const KpiCard = ({t, v, c, dark}) => (<div className={`p-3 rounded-xl border-l-4 shadow-sm ${dark ? 'bg-slate-800 border-slate-600 text-white' : `bg-white border-${c}-500`}`}><div className={`text-[10px] uppercase font-bold mb-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{t}</div><div className={`text-lg md:text-xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{typeof v === 'number' ? '$'+v.toLocaleString() : v}</div></div>);
const LogoutModal = ({onConfirm, onCancel}) => (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in"><div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-2xl text-center"><AlertTriangle size={48} className="mx-auto text-red-500 mb-4"/><h3 className="text-xl font-bold text-slate-800 mb-2">¿Cerrar Sesión?</h3><p className="text-slate-500 text-sm mb-6">Tendrás que ingresar el ID de empresa nuevamente.</p><div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Cancelar</button><button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg">Sí, salir</button></div></div></div>);