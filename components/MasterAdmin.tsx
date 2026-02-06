
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  Trash2, 
  ShieldAlert, 
  Download, 
  Eye, 
  X, 
  Loader2, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  Package,
  Calendar,
  Image as ImageIcon,
  Maximize2,
  Lock,
  ArrowRightLeft,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { cloudSync } from '../services/cloudService';
import { UserRole } from '../types';

const MasterAdmin: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedUser, setInspectedUser] = useState<any | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    const data = await cloudSync.adminListAccounts();
    setAccounts(data);
    setIsLoading(false);
  };

  const handleInspect = async (email: string) => {
    setIsInspecting(true);
    const data = await cloudSync.adminGetUserData(email);
    setInspectedUser({ email, data });
    setIsInspecting(false);
  };

  const handleDelete = async (email: string) => {
    if (confirm(`Permanently WIPE this account? All cloud data for ${email} will be erased forever.`)) {
      await cloudSync.adminDeleteAccount(email);
      loadAccounts();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { email, password, name } = newUserData;
    
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: '0000000000',
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      provider: 'email',
      isVerified: true,
      role: UserRole.AIRBNB_HOST,
      createdAt: new Date().toISOString()
    };

    const initialData = { 
      currentUser: newUser, 
      properties: [], allBookings: [], allTransactions: [], allGuests: [], allStaffLogs: [], allInventory: [] 
    };

    const success = await cloudSync.createAccount(email, password, initialData);
    if (success) {
      setNewUserData({ email: '', password: '', name: '' });
      setShowAddUser(false);
      loadAccounts();
    } else {
      alert("Failed to create account. Email may already exist.");
    }
    setIsLoading(false);
  };

  const downloadID = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename || 'guest_id_document.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAccounts = accounts.filter(a => a.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-white/5 px-10 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/20">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Account Backend</h1>
            <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase mt-1">Platform Administrative Command</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100">
            <UserPlus className="w-4 h-4" /> Create User
          </button>
          <button onClick={onExit} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="p-10 max-w-7xl mx-auto space-y-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Accounts</p>
              <p className="text-4xl font-black">{accounts.length}</p>
           </div>
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                 <p className="text-lg font-black uppercase">Live</p>
              </div>
           </div>
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 md:col-span-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cloud Storage Engine</p>
              <p className="text-lg font-black uppercase text-indigo-400 truncate">v21 STABLE • MULTI-DEVICE SYNC</p>
           </div>
        </div>

        {/* User Search & Table */}
        <div className="bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-black uppercase tracking-tight">Active Tenants</h2>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Find account..." 
                className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-[3px] font-black text-slate-500 border-b border-white/5">
                  <th className="px-10 py-6">Registered Email</th>
                  <th className="px-10 py-6">Security Key</th>
                  <th className="px-10 py-6">Signup Date</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" /></td></tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-500 italic uppercase text-[10px] font-black tracking-widest">No accounts found</td></tr>
                ) : (
                  filteredAccounts.map(acc => (
                    <tr key={acc.email} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6 font-bold text-slate-300">{acc.email}</td>
                      <td className="px-10 py-6 font-mono text-[10px] text-slate-500">{"*".repeat(acc.password.length)}</td>
                      <td className="px-10 py-6 text-[10px] font-bold text-slate-500">{new Date(acc.createdAt).toLocaleDateString()}</td>
                      <td className="px-10 py-6 text-right space-x-2">
                        <button onClick={() => handleInspect(acc.email)} className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 rounded-xl transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(acc.email)} className="p-3 bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Account Data Inspector */}
      {inspectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-10 flex flex-col animate-in fade-in">
          <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col bg-slate-900 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
            <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black">{inspectedUser.email.charAt(0).toUpperCase()}</div>
                 <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">{inspectedUser.email}</h2>
                    <p className="text-[10px] text-indigo-400 font-black tracking-[0.3em] uppercase mt-1">Deep Data Inspection (Cloud Reflect)</p>
                 </div>
               </div>
               <button onClick={() => setInspectedUser(null)} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white"><X className="w-8 h-8" /></button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Left: Inventory Oversight */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-black uppercase">Live Inventory Reflect</h3>
                  </div>
                  <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                     {!inspectedUser.data?.allInventory || inspectedUser.data.allInventory.length === 0 ? (
                       <div className="text-center py-10 opacity-30 italic">No inventory data available</div>
                     ) : (
                       inspectedUser.data.allInventory.map((item: any) => (
                         <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div>
                               <p className="text-xs font-black uppercase">{item.name}</p>
                               <p className="text-[9px] text-slate-500 font-bold uppercase">{item.category}</p>
                            </div>
                            <div className="text-right">
                               <span className={`text-sm font-black ${item.quantity <= item.minThreshold ? 'text-rose-500' : 'text-emerald-400'}`}>{item.quantity} {item.unit}</span>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>

               {/* Right: CRM Media Center */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-lg font-black uppercase">Guest ID Documents</h3>
                  </div>
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                    {!inspectedUser.data?.allGuests || inspectedUser.data.allGuests.filter((g: any) => g.idFileData).length === 0 ? (
                       <div className="bg-black/20 p-12 rounded-[2.5rem] text-center border border-white/5 opacity-40">
                          <ImageIcon className="w-10 h-10 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Media Documented</p>
                       </div>
                    ) : (
                      inspectedUser.data.allGuests.filter((g: any) => g.idFileData).map((guest: any) => (
                        <div key={guest.id} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden group">
                           <div className="p-6 border-b border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">{guest.name.charAt(0)}</div>
                                 <div>
                                    <p className="text-xs font-black uppercase leading-none mb-1">{guest.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{guest.idType} • {guest.idNumber || 'NO REF'}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => downloadID(guest.idFileData, `ID_${guest.name.replace(/\s+/g, '_')}.jpg`)}
                                className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                 <Download className="w-4 h-4" />
                              </button>
                           </div>
                           <div className="aspect-video bg-black/40 relative flex items-center justify-center p-4">
                              <img src={guest.idFileData} className="max-h-full max-w-full object-contain shadow-2xl" />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Guest Identification Artifact</p>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
            
            <footer className="p-10 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-black uppercase tracking-widest">
               <div className="flex items-center gap-3"><Database className="w-4 h-4" /> User Content Mirror</div>
               <div>HostFlow v21 Management Node</div>
            </footer>
          </div>
        </div>
      )}

      {/* Manual Account Provisioning */}
      {showAddUser && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-10 animate-in zoom-in-95">
           <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase tracking-tight">Manual Provision</h2>
                 <button onClick={() => setShowAddUser(false)}><X className="w-8 h-8 text-slate-500" /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
                    <input required type="text" placeholder="Manager Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Login Email</label>
                    <input required type="email" placeholder="email@identity.com" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Secret Password</label>
                    <input required type="password" placeholder="Min 6 characters" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Generate Account Path</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdmin;
