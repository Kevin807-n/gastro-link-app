import React, { useState, useEffect } from 'react';

// --- FIREBASE ---
import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { 
  collection, addDoc, updateDoc, doc, query, where, orderBy,
  onSnapshot, serverTimestamp, writeBatch, setDoc, deleteDoc, getDoc, limit, increment 
} from 'firebase/firestore'; // IMPORTANTE: 'increment' es clave para el stock

// --- ICONOS & UTILIDADES ---
import { RefreshCw, Lock } from 'lucide-react';

// --- VISTAS ---
import LoginView from './views/LoginView';
import SuperAdminView from './views/SuperAdminView';
import RoleSelectView from './views/RoleSelectView';
import AdminView from './views/AdminView';
import KitchenView from './views/KitchenView';
import WaiterView from './views/WaiterView';

// --- DATOS GLOBALES ---
const DEFAULT_PINS = { admin: "1234", kitchen: "5555", waiter: "0000" };
const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CATEGORIES = ["Fuertes", "Entradas", "Bebidas", "Postres", "Otros"];

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
  
  // Datos Operativos
  const [storeStatus, setStoreStatus] = useState('open');
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [myReadyOrders, setMyReadyOrders] = useState([]); 
  const [expenses, setExpenses] = useState([]);
  const [waiterStats, setWaiterStats] = useState({});
  const [salesTotal, setSalesTotal] = useState(0);

  // Datos Financieros (Historial)
  const [dailyClosings, setDailyClosings] = useState([]);

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
  
  // Estados Vistas Internas
  const [waiterView, setWaiterView] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState("Fuertes");
  const [cart, setCart] = useState([]);
  const [tableNum, setTableNum] = useState("");
  
  // Personalización de Pedido (Modal Mesero)
  const [itemToCustomize, setItemToCustomize] = useState(null);
  
  const [adminTab, setAdminTab] = useState('pos');
  
  // Formulario Nuevo Plato (Con Stock y Modificadores)
  const [newItemForm, setNewItemForm] = useState({ name: "", price: "", category: "Fuertes", stock: "", modifiers: "" });
  
  const [newExpense, setNewExpense] = useState({ desc: "", amount: "" });
  
  const [settingsForm, setSettingsForm] = useState({ 
    nit: "", address: "", phone: "", footer: "", logoUrl: "",
    pinAdmin: "", pinKitchen: "", pinWaiter: "" 
  });
  
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);

  // --- 1. INICIO & AUTH ---
  const requestLogout = () => setLogoutConfirmOpen(true);

  const confirmLogout = () => {
     localStorage.removeItem('gl_company_id');
     localStorage.removeItem('gl_role');
     localStorage.removeItem('gl_waiter_name');
     setCompany(null); setRole(null); setWaiterName(""); setIsSuperAdmin(false); 
     setLogoutConfirmOpen(false); setLoginForm({id: "", pass: ""}); setAuditData(null);
     window.location.reload(); 
  };

  const exitRole = () => {
     localStorage.removeItem('gl_role');
     window.location.reload(); 
  };

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

      try {
          await signInAnonymously(auth);
      } catch (error) {
          console.error("Error Firebase:", error);
      }
      setIsLoading(false);
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- 2. LISTENERS ---
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
        if(snap.exists()) { 
          setCompanySettings(snap.data()); 
          setSettingsForm(snap.data()); 
        }
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
       const active = all.filter(o => o.status !== 'paid' && o.status !== 'closed').sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
       setActiveOrders(active);
       
       if(role==='waiter') setMyReadyOrders(active.filter(o => o.waiterId === user.uid && o.status === 'ready'));
       
       if(role==='admin') {
          const paidToday = all.filter(o => o.status === 'paid'); 
          let t = 0; let ws = {};
          paidToday.forEach(d => { t += d.total; ws[d.waiterName||"Anon"] = (ws[d.waiterName||"Anon"]||0)+d.total; });
          setSalesTotal(t); setWaiterStats(ws);
       }
    });

    let unsubExp = () => {};
    let unsubClosings = () => {};

    if(role==='admin') {
        unsubExp = onSnapshot(query(collection(db, 'gl_expenses'), where('companyId', '==', company.id)), (s) => {
            const currentExpenses = s.docs.map(d => ({id:d.id, ...d.data()})).filter(e => !e.isClosed);
            setExpenses(currentExpenses);
        });

        const qClosings = query(collection(db, 'gl_daily_closings'), where('companyId', '==', company.id), orderBy('date', 'desc'), limit(20));
        unsubClosings = onSnapshot(qClosings, (snap) => {
            setDailyClosings(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
    }

    return () => { unsubSettings(); unsubStore(); unsubOrders(); unsubMenu(); unsubExp(); unsubClosings(); };
  }, [user, company, role, isSuperAdmin]);

  // --- 3. LÓGICA Y FUNCIONES ---
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
     let correctPin = "";
     if (targetRole === 'admin') correctPin = companySettings.pinAdmin || DEFAULT_PINS.admin;
     if (targetRole === 'kitchen') correctPin = companySettings.pinKitchen || DEFAULT_PINS.kitchen;
     if (targetRole === 'waiter') correctPin = companySettings.pinWaiter || DEFAULT_PINS.waiter;

     if (correctPin === pinInput) {
        if(targetRole === 'waiter' && !waiterName) {
           const n = prompt("Tu nombre:");
           if(n) { setWaiterName(n); localStorage.setItem('gl_waiter_name', n); }
        }
        setRole(targetRole); localStorage.setItem('gl_role', targetRole); setIsPinModalOpen(false); setPinInput("");
     } else { 
        alert("PIN Incorrecto"); 
        setPinInput(""); 
     }
  };

  const handleCloseDayFinal = async () => {
    if (!confirm("⚠️ ¿Estás seguro de CERRAR EL DÍA?\n\nLas ventas volverán a cero y se guardará el historial.")) return;

    setIsLoading(true);
    const batch = writeBatch(db);
    
    try {
        const qOrders = query(collection(db, 'gl_orders'), where('companyId', '==', company.id), where('status', '==', 'paid'));
        const { getDocs } = await import('firebase/firestore'); 
        const ordersSnap = await getDocs(qOrders);
        
        ordersSnap.forEach((doc) => {
            batch.update(doc.ref, { status: 'closed' });
        });

        expenses.forEach((exp) => {
            const ref = doc(db, 'gl_expenses', exp.id);
            batch.update(ref, { isClosed: true });
        });

        const reportRef = doc(collection(db, 'gl_daily_closings'));
        const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
        batch.set(reportRef, {
            companyId: company.id,
            date: serverTimestamp(),
            sales: salesTotal,
            expenses: totalExpenses,
            profit: salesTotal - totalExpenses,
            closedBy: user.uid || 'anon'
        });

        await batch.commit();
        alert("✅ Caja Cerrada Exitosamente.");
        
        setSalesTotal(0);
        setExpenses([]);
        
    } catch (error) {
        console.error("Error al cerrar caja:", error);
        alert("Hubo un error al cerrar. Revisa la consola.");
    }
    setIsLoading(false);
  };

  const auditCompany = async (cid) => {
     const qO = query(collection(db, 'gl_orders'), where('companyId', '==', cid));
     const qE = query(collection(db, 'gl_expenses'), where('companyId', '==', cid));
     
     const [snapO, snapE] = await Promise.all([
         new Promise(resolve => { const u = onSnapshot(qO, (s) => { u(); resolve(s); }); }),
         new Promise(resolve => { const u = onSnapshot(qE, (s) => { u(); resolve(s); }); })
     ]);

     let sales = 0; let expenses = 0; let count = 0; let itemsCount = {};
     snapO.docs.forEach(d => { 
         if(d.data().status === 'paid' || d.data().status === 'closed') { 
             sales += d.data().total; count++; 
             if(Array.isArray(d.data().items)) {
                d.data().items.forEach(item => itemsCount[item.name] = (itemsCount[item.name] || 0) + 1);
             }
         } 
     });
     snapE.docs.forEach(d => { expenses += d.data().amount; });
     const topProduct = Object.entries(itemsCount).sort((a,b) => b[1] - a[1])[0];

     setAuditData({ 
         id: cid, sales, expenses, profit: sales - expenses, 
         topProduct: topProduct ? `${topProduct[0]} (${topProduct[1]})` : "Ninguno", orderCount: count
     });
  };

  const sendOrder = async () => {
    if (!tableNum || cart.length === 0) return alert("Faltan datos");
    
    // --- LÓGICA DE STOCK ---
    // Usamos batch para asegurar que se crea el pedido Y se resta el stock al mismo tiempo
    const batch = writeBatch(db);
    
    // 1. Crear el Pedido
    const orderRef = doc(collection(db, 'gl_orders'));
    batch.set(orderRef, {
       companyId: company.id, waiterId: user.uid, waiterName: waiterName,
       table: parseInt(tableNum), items: cart, status: 'pending',
       total: cart.reduce((a,b)=>a+b.price,0), createdAt: serverTimestamp()
    });

    // 2. Restar Stock (Solo si el item tiene stock definido y válido)
    cart.forEach(item => {
        if (item.id && item.stock !== undefined && item.stock !== "") {
            const itemRef = doc(db, 'gl_menus', item.id);
            batch.update(itemRef, { stock: increment(-1) });
        }
    });

    await batch.commit();
    setCart([]); setTableNum("");
  };

  const updateStatus = async (oid, st) => {
     setActiveOrders(prev => prev.map(o => o.id === oid ? { ...o, status: st } : o));
     if(role==='waiter' && st==='delivered') setMyReadyOrders(prev => prev.filter(o => o.id !== oid));
     await updateDoc(doc(db, 'gl_orders', oid), { status: st });
  };

  // --- IMPRESIÓN PROFESIONAL ---
  const printReceipt = (items, total, table) => {
      const win = window.open('', '', 'width=300,height=600');
      win.document.write(`
        <html>
            <head>
                <title>Ticket</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; width: 100%; font-size: 12px; margin: 0; box-sizing: border-box; }
                    .center { text-align: center; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                    .bold { font-weight: bold; }
                    .big { font-size: 16px; font-weight: bold; }
                    img { max-width: 80px; margin-bottom: 10px; }
                    .modifier { font-size: 10px; margin-left: 10px; font-style: italic; display: block; color: #555; }
                </style>
            </head>
            <body>
                <div class="center">
                    ${companySettings.logoUrl ? `<img src="${companySettings.logoUrl}" />` : ''}
                    <div class="big">${companySettings.name || company.id}</div>
                    <p>${companySettings.nit ? 'NIT: '+companySettings.nit : ''}</p>
                    <p>${companySettings.address||''}</p>
                    <p>${companySettings.phone||''}</p>
                    <div class="line"></div>
                    <div class="row"><span>Mesa: ${table}</span><span>${new Date().toLocaleTimeString()}</span></div>
                </div>
                <div class="line"></div>
                ${items.map(i => `
                    <div class="row">
                        <span>${i.name}</span>
                        <span>$${i.price.toLocaleString()}</span>
                    </div>
                    ${i.modifiers && i.modifiers.length > 0 ? i.modifiers.map(m => `<span class="modifier">+ ${m.name} ($${m.price})</span>`).join('') : ''}
                    ${i.note ? `<span class="modifier">Nota: ${i.note}</span>` : ''}
                `).join('')}
                <div class="line"></div>
                <div class="row big"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
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
         // Aplanamos items
         const allItems = toPay.flatMap(o => o.items);
         printReceipt(allItems, total, tid);
     }
     const batch = writeBatch(db);
     toPay.forEach(o => batch.update(doc(db, 'gl_orders', o.id), { status: 'paid' }));
     await batch.commit();
     setSelectedTableDetails(null);
  };

  const addMenuItem = async () => {
     if(!newItemForm.name) return;
     const stockVal = newItemForm.stock && newItemForm.stock !== "" ? parseInt(newItemForm.stock) : "";
     await addDoc(collection(db, 'gl_menus'), { companyId: company.id, ...newItemForm, price: parseInt(newItemForm.price), stock: stockVal });
     setNewItemForm({name:"", price:"", category:"Fuertes", stock: "", modifiers: ""});
  };
  const deleteMenuItem = async (id) => { if(confirm("¿Borrar?")) await deleteDoc(doc(db, 'gl_menus', id)); };
  
  const addExpense = async () => {
     if(!newExpense.desc) return;
     await addDoc(collection(db, 'gl_expenses'), { companyId: company.id, description: newExpense.desc, amount: parseInt(newExpense.amount), createdAt: serverTimestamp(), isClosed: false });
     setNewExpense({desc:"", amount:""});
  };
  const deleteExpense = async (id) => await deleteDoc(doc(db, 'gl_expenses', id));

  const saveSettings = async () => {
      await setDoc(doc(db, 'gl_settings', company.id), settingsForm);
      setSettingsOpen(false); alert("Guardado");
  };

  // --- RENDER ---
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-900"><RefreshCw className="animate-spin text-blue-500" size={40}/></div>;
  if (isSuperAdmin) return <SuperAdminView allCompanies={allCompanies} globalStats={globalStats} confirmLogout={confirmLogout} auditCompany={auditCompany} auditData={auditData} setAuditData={setAuditData} />;
  if (!company) return <LoginView loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} isRegistering={isRegistering} setIsRegistering={setIsRegistering} authMsg={authMsg} />;
  
  if (storeStatus === 'closed' && role !== 'admin') {
     return (
        <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
            <Lock size={60} className="text-red-500 mb-4"/><h1 className="text-4xl font-black">CERRADO</h1>
            <button onClick={()=>{setTargetRole('admin');setIsPinModalOpen(true)}} className="mt-8 border px-4 py-1 rounded text-xs hover:bg-white hover:text-black transition-colors">Soy Admin</button>
            {isPinModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
                    <div className="bg-white p-6 rounded text-black w-64">
                        <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} className="border p-2 mb-2 w-full text-center text-xl font-bold" autoFocus/>
                        <button onClick={handleRoleAuth} className="w-full bg-red-600 text-white py-2 rounded font-bold">Entrar</button>
                        <button onClick={()=>setIsPinModalOpen(false)} className="mt-2 w-full text-slate-500 text-sm">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
     );
  }
  if (!role) return <RoleSelectView company={company} requestLogout={requestLogout} setTargetRole={setTargetRole} setIsPinModalOpen={setIsPinModalOpen} isPinModalOpen={isPinModalOpen} targetRole={targetRole} pinInput={pinInput} setPinInput={setPinInput} handleRoleAuth={handleRoleAuth} logoutConfirmOpen={logoutConfirmOpen} confirmLogout={confirmLogout} setLogoutConfirmOpen={setLogoutConfirmOpen} />;
  
  if (role === 'admin') {
     return <AdminView 
        company={company} companySettings={companySettings} storeStatus={storeStatus} toggleStoreStatus={async()=>{const n=storeStatus==='open'?'closed':'open';await updateDoc(doc(db,'gl_stores',company.id),{status:n})}} 
        exitRole={exitRole} adminTab={adminTab} setAdminTab={setAdminTab} TABLES={TABLES} activeOrders={activeOrders} selectedTableDetails={selectedTableDetails} 
        setSelectedTableDetails={setSelectedTableDetails} payTable={payTable} menuItems={menuItems} newItemForm={newItemForm} setNewItemForm={setNewItemForm} 
        addMenuItem={addMenuItem} deleteMenuItem={deleteMenuItem} CATEGORIES={CATEGORIES} salesTotal={salesTotal} expenses={expenses} 
        netProfit={salesTotal - expenses.reduce((a,b)=>a+b.amount,0)} waiterStats={waiterStats} newExpense={newExpense} setNewExpense={setNewExpense} 
        addExpense={addExpense} deleteExpense={deleteExpense} settingsForm={settingsForm} setSettingsForm={setSettingsForm} saveSettings={saveSettings} 
        settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} 
        handleCloseDay={handleCloseDayFinal} 
        dailyClosings={dailyClosings} 
      />;
  }
  
  if (role === 'kitchen') return <KitchenView company={company} activeOrders={activeOrders} exitRole={exitRole} updateStatus={updateStatus} />;
  
  // Render Waiter View
  return <WaiterView 
      waiterName={waiterName} company={company} companySettings={companySettings} exitRole={exitRole} waiterView={waiterView} setWaiterView={setWaiterView} 
      TABLES={TABLES} tableNum={tableNum} setTableNum={setTableNum} CATEGORIES={CATEGORIES} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} 
      menuItems={menuItems} activeOrders={activeOrders} cart={cart} sendOrder={sendOrder} myReadyOrders={myReadyOrders} updateStatus={updateStatus} 
      // Nuevas props pasadas:
      itemToCustomize={itemToCustomize} setItemToCustomize={setItemToCustomize} setCart={setCart} 
  />;
}