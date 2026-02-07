
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  LogOut, 
  Menu, 
  Package, 
  Wallet, 
  ClipboardCheck, 
  X, 
  Briefcase, 
  Leaf, 
  Bell,
  Building2,
  Plus,
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  Settings as SettingsIcon,
  CircleCheck,
  CloudCheck,
  CloudAlert
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import Guests from './components/Guests';
import Inventory from './components/Inventory';
import StaffPortal from './components/StaffPortal';
import Financials from './components/Financials';
import CheckInCounter from './components/CheckInCounter';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { Booking, Transaction, Guest, StaffLog, PropertyConfig, InventoryItem, StayPackage } from './types';
import { MOCK_INVENTORY } from './constants';
import { cloudSync, MASTER_EMAIL } from './services/cloudService';

enum View {
  DASHBOARD = 'Dashboard',
  RECEPTION = 'Reception Desk',
  BOOKINGS = 'Bookings',
  GUESTS = 'Guests CRM',
  INVENTORY = 'Inventory',
  FINANCIALS = 'Financials',
  STAFF_PORTAL = 'Staff Portal',
  SETTINGS = 'Settings'
}

const CACHE_KEY = 'hostflow_local_cache_v39';

const DEFAULT_PACKAGES: StayPackage[] = [
  { id: 'p1', title: 'Basic Stay', desc: 'Standard room access.', iconType: 'home' },
  { id: 'p2', title: 'Premium Suite', desc: 'Luxury quarters upgrade.', iconType: 'star' },
  { id: 'p3', title: 'Event Hall', desc: 'Access to gardens and main hall.', iconType: 'sparkles' }
];

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReadyForSync, setIsReadyForSync] = useState(false); 
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  const [properties, setProperties] = useState<PropertyConfig[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | 'all'>('all');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [allStaffLogs, setAllStaffLogs] = useState<StaffLog[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]); 
  const [stayPackages, setStayPackages] = useState<StayPackage[]>(DEFAULT_PACKAGES);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(MASTER_EMAIL);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  const syncTimeoutRef = useRef<number | null>(null);
  const lastPushedStateRef = useRef<string>("");

  // 1. Production Boot: Supabase Session Resume
  useEffect(() => {
    const bootstrap = async () => {
      // Step A: Load Local Cache for instant UI
      const localCache = localStorage.getItem(CACHE_KEY);
      if (localCache) {
        try {
          const cached = JSON.parse(localCache);
          rehydrateState(cached);
        } catch (e) { console.warn("Local cache corrupt"); }
      }

      // Step B: Resume Supabase Session (Secure Token Exchange)
      try {
        const cloudData = await cloudSync.resumeSession();
        if (cloudData) {
          setIsAuthenticated(true);
          rehydrateState(cloudData); // Cloud state is authoritative
          setIsReadyForSync(true); 
        }
      } catch (e) {
        console.error("Session resume failed");
      } finally {
        setIsInitialLoading(false);
      }
    };
    bootstrap();
  }, []);

  const rehydrateState = (data: any) => {
    if (!data) return;
    
    if (data.properties) setProperties(data.properties);
    if (data.allBookings) setAllBookings(data.allBookings);
    if (data.allTransactions) setAllTransactions(data.allTransactions);
    if (data.allGuests) setAllGuests(data.allGuests);
    if (data.allStaffLogs) setAllStaffLogs(data.allStaffLogs);
    if (data.stayPackages) setStayPackages(data.stayPackages);
    if (data.activePropertyId) setActivePropertyId(data.activePropertyId);
    if (data.userEmail) setCurrentUserEmail(data.userEmail);

    const propId = data.activePropertyId || (data.properties?.[0]?.id) || 'prop-1';
    let inv = data.allInventory || [];
    
    if (inv.length < 3 && data.properties?.length > 0) {
      inv = MOCK_INVENTORY.map(item => ({ ...item, propertyId: propId }));
    }
    setAllInventory(inv);

    lastPushedStateRef.current = JSON.stringify({
      properties: data.properties,
      allBookings: data.allBookings,
      allTransactions: data.allTransactions,
      allGuests: data.allGuests,
      allInventory: inv
    });
  };

  // 2. Production Autosave (Supabase Upsert)
  useEffect(() => { 
    if (isAuthenticated && !isInitialLoading && isReadyForSync) {
      const currentState = {
        properties, 
        activePropertyId, 
        allBookings, 
        allTransactions, 
        allGuests, 
        allStaffLogs, 
        allInventory, 
        stayPackages,
        userEmail: currentUserEmail,
        timestamp: Date.now()
      };

      const currentStateString = JSON.stringify({
        properties,
        allBookings,
        allTransactions,
        allGuests,
        allInventory
      });

      if (currentStateString === lastPushedStateRef.current) return;

      localStorage.setItem(CACHE_KEY, JSON.stringify(currentState));

      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = window.setTimeout(async () => {
        setIsSyncing(true);
        const success = await cloudSync.pushData(currentState);
        if (success) {
          lastPushedStateRef.current = currentStateString;
        }
        setIsSyncing(false);
      }, 2500);
    }
  }, [properties, activePropertyId, allBookings, allTransactions, allGuests, allStaffLogs, allInventory, stayPackages, isAuthenticated, isInitialLoading, isReadyForSync, currentUserEmail]);

  const handleLogin = (email: string, password: string, remoteData: any) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    rehydrateState(remoteData);
    setIsReadyForSync(true); 
  };

  const handleLogout = async () => {
    if (window.confirm("Disconnect from production vault?")) {
      await cloudSync.logout();
      localStorage.removeItem(CACHE_KEY);
      window.location.reload();
    }
  };

  const handleAddProperty = (newConfig: PropertyConfig) => {
    setProperties(prev => [...prev, newConfig]);
    setActivePropertyId(newConfig.id);
    const initialInventory = MOCK_INVENTORY.map(item => ({ ...item, propertyId: newConfig.id }));
    setAllInventory(prev => [...prev.filter(p => p.propertyId !== newConfig.id), ...initialInventory]);
    setShowAddPropertyModal(false);
  };

  const activeProperty = properties.find(p => p.id === activePropertyId);
  const filteredInventory = activePropertyId === 'all' ? allInventory : allInventory.filter(i => i.propertyId === activePropertyId);
  const finalInventoryToPass = (filteredInventory.length === 0 && allInventory.length > 0 && activePropertyId !== 'all')
    ? allInventory.map(i => ({...i, propertyId: activePropertyId})) : filteredInventory;

  const filteredBookings = activePropertyId === 'all' ? allBookings : allBookings.filter(b => b.propertyId === activePropertyId);
  const filteredTransactions = activePropertyId === 'all' ? allTransactions : allTransactions.filter(t => t.propertyId === activePropertyId);
  const filteredGuests = activePropertyId === 'all' ? allGuests : allGuests.filter(g => g.propertyId === activePropertyId);
  const filteredLogs = activePropertyId === 'all' ? allStaffLogs : allStaffLogs.filter(l => l.propertyId === activePropertyId);

  const handleAddTransaction = (newTrans: Transaction) => {
    const pId = activePropertyId === 'all' ? (properties[0]?.id || 'p1') : activePropertyId;
    setAllTransactions(prev => [{ ...newTrans, propertyId: pId }, ...prev]);
  };

  const handleAddBooking = (newBooking: Booking, newTransaction: Transaction, newGuestList?: Guest[]) => {
    const pId = activePropertyId === 'all' ? (properties[0]?.id || 'p1') : activePropertyId;
    setAllBookings(prev => [{ ...newBooking, propertyId: pId }, ...prev]);
    handleAddTransaction({ ...newTransaction, propertyId: pId });
    if (newGuestList) {
      newGuestList.forEach(g => {
        setAllGuests(prev => {
          if (prev.some(ex => ex.phone === g.phone && g.phone)) return prev;
          return [...prev, { ...g, propertyId: pId }];
        });
      });
    }
    setAllStaffLogs(prev => [{
      id: `log-${Date.now()}`,
      propertyId: pId,
      staffName: 'Portal Admin',
      action: `Check-in: ${newBooking.guestName} (${newBooking.guestsCount} guests)`,
      timestamp: new Date().toLocaleString(),
      type: 'RECEPTION'
    }, ...prev]);
  };

  const renderView = () => {
    const propName = activeProperty?.name || (properties[0]?.name || 'Portfolio');
    switch(currentView) {
      case View.DASHBOARD: return <Dashboard bookings={filteredBookings} transactions={filteredTransactions} guests={filteredGuests} staffLogs={filteredLogs} property={activeProperty || { name: 'Portfolio Overview' } as any} isGlobal={activePropertyId === 'all' || properties.length === 0} />;
      case View.RECEPTION: return <CheckInCounter onCheckInComplete={handleAddBooking} propertyName={propName} stayPackages={stayPackages} />;
      case View.BOOKINGS: return <Bookings bookings={filteredBookings} onAddBooking={handleAddBooking} onDeleteBooking={id => setAllBookings(p => p.filter(b => b.id !== id))} onUpdateBooking={b => setAllBookings(p => p.map(x => x.id === b.id ? b : x))} property={activeProperty || properties[0] || { id: 'temp', name: 'New Property', isConfigured: false } as any} onUpdateProperty={p => setProperties(x => x.map(y => y.id === p.id ? p : y))} />;
      case View.GUESTS: return <Guests guests={filteredGuests} transactions={allTransactions} bookings={allBookings} propertyName={propName} onDeleteGuest={id => setAllGuests(p => p.filter(g => g.id !== id))} onAddGuest={g => setAllGuests(prev => [...prev, { ...g, propertyId: activePropertyId === 'all' ? (properties[0]?.id || 'p1') : activePropertyId }])} onUpdateGuest={g => setAllGuests(prev => prev.map(x => x.id === g.id ? g : x))} />;
      case View.INVENTORY: return <Inventory propertyName={propName} bookings={filteredBookings} inventoryItems={finalInventoryToPass} onUpdateInventory={setAllInventory} activePropertyId={activePropertyId === 'all' ? properties[0]?.id : activePropertyId} />;
      case View.FINANCIALS: return <Financials transactions={filteredTransactions} onAddTransaction={handleAddTransaction} onUpdateTransaction={t => setAllTransactions(p => p.map(x => x.id === t.id ? t : x))} onDeleteTransaction={id => setAllTransactions(p => p.filter(t => t.id !== id))} />;
      case View.STAFF_PORTAL: return <StaffPortal propertyName={propName} guests={filteredGuests} property={activeProperty || properties[0] || { id: 'p1', name: 'Portfolio' } as any} staffLogs={filteredLogs} onAddTransaction={handleAddTransaction} bookings={filteredBookings} transactions={filteredTransactions} stayPackages={stayPackages} onUpdatePackages={setStayPackages} />;
      case View.SETTINGS: return <Settings allData={{ properties, activePropertyId, allBookings, allTransactions, allGuests, allStaffLogs, allInventory, stayPackages }} onImportSync={rehydrateState} />;
      default: return null;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8">
        <div className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-pulse">
          <Leaf className="w-12 h-12" />
        </div>
        <div className="text-center space-y-4">
          <p className="text-emerald-500 font-black text-sm uppercase tracking-[0.7em] animate-pulse">Supabase Handshake</p>
          <div className="flex gap-3 justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;
  
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-inter text-slate-900">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-10 px-2">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Leaf className="w-7 h-7" /></div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">HostFlow</span>
          </div>

          <div className="mb-8 px-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Properties</span>
              <button onClick={() => setShowAddPropertyModal(true)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              <button onClick={() => { setActivePropertyId('all'); setCurrentView(View.DASHBOARD); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activePropertyId === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                <LayoutGrid className="w-4 h-4" /><span className="text-[10px] font-black uppercase truncate">Asset Overview</span>
              </button>
              {properties.map(p => (
                <button key={p.id} onClick={() => { setActivePropertyId(p.id); setCurrentView(View.DASHBOARD); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activePropertyId === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Building2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === View.DASHBOARD} onClick={() => { setCurrentView(View.DASHBOARD); setIsSidebarOpen(false); }} />
            <SidebarItem icon={ClipboardCheck} label="Reception Desk" active={currentView === View.RECEPTION} onClick={() => { setCurrentView(View.RECEPTION); setIsSidebarOpen(false); }} />
            <SidebarItem icon={CalendarDays} label="Bookings" active={currentView === View.BOOKINGS} onClick={() => { setCurrentView(View.BOOKINGS); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Users} label="Guests CRM" active={currentView === View.GUESTS} onClick={() => { setCurrentView(View.GUESTS); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Package} label="Inventory" active={currentView === View.INVENTORY} onClick={() => { setCurrentView(View.INVENTORY); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Wallet} label="Financials" active={currentView === View.FINANCIALS} onClick={() => { setCurrentView(View.FINANCIALS); setIsSidebarOpen(false); }} />
            
            <div className="pt-6 mt-6 border-t border-slate-50">
              <SidebarItem icon={Briefcase} label="Staff Portal" active={currentView === View.STAFF_PORTAL} onClick={() => { setCurrentView(View.STAFF_PORTAL); setIsSidebarOpen(false); }} />
              <SidebarItem icon={SettingsIcon} label="Vault Sync" active={currentView === View.SETTINGS} onClick={() => { setCurrentView(View.SETTINGS); setIsSidebarOpen(false); }} />
            </div>
          </nav>

          <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-600 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-black text-sm uppercase tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-auto bg-[#f8fafc]">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-3 bg-slate-50 rounded-xl text-slate-500" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all ${isSyncing ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-50'}`}>
               {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.1em]">{isSyncing ? 'Pushing to Supabase...' : 'Postgres Vault Active'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Production Node</p>
               <p className="text-xs font-black text-slate-900">{currentUserEmail}</p>
            </div>
            <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 relative transition-colors">
              <Bell className="w-5 h-5" /><span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">{renderView()}</div>
      </main>

      {showAddPropertyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 relative">
            <button onClick={() => setShowAddPropertyModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-10"><X className="w-6 h-6" /></button>
            <div className="p-10">
              <Onboarding isModal onComplete={handleAddProperty} defaultManager={{ name: 'Admin', email: currentUserEmail, phone: '98290-52963' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
