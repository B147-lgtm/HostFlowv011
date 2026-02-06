
import React, { useState, useEffect, useRef } from 'react';
import { Guest, Transaction, Booking, TransactionType } from '../types';
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  X, 
  Loader2, 
  Receipt, 
  History, 
  CreditCard, 
  Download, 
  Upload, 
  RefreshCw,
  Trash2,
  FileCheck,
  Plus,
  // Added missing CheckCircle2 import
  CheckCircle2
} from 'lucide-react';

interface GuestsProps {
  guests: Guest[];
  transactions: Transaction[];
  bookings: Booking[];
  propertyName: string;
  onDeleteGuest: (id: string) => void;
  onAddGuest: (guest: Guest) => void;
  onUpdateGuest: (guest: Guest) => void;
}

const Guests: React.FC<GuestsProps> = ({ guests, transactions, bookings, propertyName, onDeleteGuest, onAddGuest, onUpdateGuest }) => {
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(guests[0]?.id ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isProcessingNewId, setIsProcessingNewId] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newGuestIdInputRef = useRef<HTMLInputElement>(null);

  const selectedGuest = guests.find(g => g.id === selectedGuestId) ?? null;

  const [newGuestForm, setNewGuestForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    idType: 'Aadhar Card',
    idNumber: '',
    idFileName: null as string | null,
    idFileData: null as string | null
  });

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const readerResult = reader.result;
      if (typeof readerResult !== 'string') return;
      
      try {
        if (isAddingNew) {
          setIsProcessingNewId(true);
          const optimized = await compressImage(readerResult);
          setNewGuestForm(prev => ({ 
            ...prev, 
            idFileName: file.name, 
            idFileData: optimized 
          }));
          setIsProcessingNewId(false);
        } else if (selectedGuest) {
          setIsUploading(true);
          const optimized = await compressImage(readerResult);
          const updatedGuest: Guest = { 
            ...selectedGuest, 
            idFileName: file.name,
            idFileData: optimized 
          };
          onUpdateGuest(updatedGuest);
          setIsUploading(false);
        }
      } catch (err) {
        console.error("ID optimization failed", err);
        setIsUploading(false);
        setIsProcessingNewId(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      propertyId: '', 
      name: newGuestForm.name.toUpperCase(),
      email: newGuestForm.email,
      phone: newGuestForm.phone,
      rating: 5,
      totalStays: 0,
      lastStay: 'Never',
      notes: newGuestForm.notes,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newGuestForm.name}`,
      idType: newGuestForm.idType,
      idNumber: newGuestForm.idNumber,
      idFileName: newGuestForm.idFileName || undefined,
      idFileData: newGuestForm.idFileData || undefined
    };
    onAddGuest(newGuest);
    setSelectedGuestId(newGuest.id);
    setIsAddingNew(false);
    setNewGuestForm({ name: '', phone: '', email: '', notes: '', idType: 'Aadhar Card', idNumber: '', idFileName: null, idFileData: null });
  };

  const getGuestLifetimeRevenue = (guestId: string) => {
    const guestTransactions = transactions.filter(t => t.referenceId === guestId);
    const guestBookings = bookings.filter(b => b.guestId === guestId);
    const totalExtra = guestTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const totalBooking = guestBookings.reduce((s, b) => s + b.totalPrice, 0);
    return totalBooking + totalExtra;
  };

  useEffect(() => {
    if (!selectedGuestId && guests.length > 0) {
      setSelectedGuestId(guests[0]?.id ?? null);
    } else if (selectedGuestId && !guests.some(g => g.id === selectedGuestId)) {
      setSelectedGuestId(guests[0]?.id ?? null);
    }
  }, [guests, selectedGuestId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto font-inter">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="w-24 h-24 text-emerald-400" /></div>
          <div className="relative z-10">
            <h2 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Repository
            </h2>
            <button 
              onClick={() => setIsAddingNew(true)}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all active:scale-[0.98] shadow-xl shadow-emerald-950/20"
            >
              <UserPlus className="w-4 h-4" /> Register New Entry
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Identity Archive
          </h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {guests.length === 0 ? (
              <div className="p-8 text-center text-slate-300 italic text-[10px] uppercase tracking-widest bg-white border border-slate-50 rounded-2xl">Ledger Empty</div>
            ) : (
              guests.map((guest) => (
                <div key={guest.id} onClick={() => { setSelectedGuestId(guest.id); setIsAddingNew(false); }} className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${selectedGuestId === guest.id && !isAddingNew ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 text-white' : 'bg-white border-slate-50 text-slate-900 hover:border-indigo-100'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${selectedGuestId === guest.id && !isAddingNew ? 'bg-white/20 text-white' : 'bg-slate-50 text-indigo-500 shadow-inner'}`}>
                      {guest.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                         <h3 className="font-black uppercase text-sm truncate tracking-tight">{guest.name}</h3>
                         {guest.idFileData && <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${selectedGuestId === guest.id ? 'text-emerald-300' : 'text-emerald-500'}`} />}
                      </div>
                      <p className={`text-[9px] font-bold uppercase mt-1 tracking-widest ${selectedGuestId === guest.id && !isAddingNew ? 'text-indigo-100' : 'text-slate-400'}`}>{guest.totalStays} STAYS RECORDED</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {isAddingNew ? (
          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><UserPlus className="w-7 h-7" /></div>
                    New CRM Identity
                  </h2>
                  <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-2 ml-1">Bespoke Guest Registration Path</p>
               </div>
               <button onClick={() => setIsAddingNew(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all"><X className="w-8 h-8" /></button>
             </div>

             <form onSubmit={handleAddNewGuest} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Legal Name</label>
                    <input required className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] font-black uppercase text-sm placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="E.G. ADITI RAO HYDARI" value={newGuestForm.name} onChange={e => setNewGuestForm({...newGuestForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Contact Phone</label>
                    <input required className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-sm outline-none" placeholder="+91 XXXXX XXXXX" value={newGuestForm.phone} onChange={e => setNewGuestForm({...newGuestForm, phone: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Email Address</label>
                    <input type="email" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-sm outline-none" placeholder="guest@identity.com" value={newGuestForm.email} onChange={e => setNewGuestForm({...newGuestForm, email: e.target.value})} />
                 </div>
               </div>

               {/* ID Registration Section */}
               <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Identity Verification Vault</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">ID Classification</label>
                       <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase outline-none" value={newGuestForm.idType} onChange={e => setNewGuestForm({...newGuestForm, idType: e.target.value})}>
                          <option>Aadhar Card</option><option>Passport</option><option>Driving License</option><option>Voter ID</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">ID Reference Number</label>
                       <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase outline-none" placeholder="XXXX-XXXX-XXXX" value={newGuestForm.idNumber} onChange={e => setNewGuestForm({...newGuestForm, idNumber: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Verification Artifact</label>
                     <div className="flex flex-col sm:flex-row gap-6">
                        <input ref={newGuestIdInputRef} type="file" className="hidden" accept="image/*" onChange={handleIdUpload} />
                        <button 
                          type="button" 
                          onClick={() => newGuestIdInputRef.current?.click()}
                          className={`flex-1 min-h-[160px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all ${
                            newGuestForm.idFileData ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-300 hover:border-indigo-400 hover:text-indigo-600'
                          }`}
                        >
                          {isProcessingNewId ? (
                             <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                          ) : newGuestForm.idFileData ? (
                             <><CheckCircle2 className="w-10 h-10 text-emerald-500" /><span className="text-[10px] font-black uppercase tracking-widest">Identity Captured</span></>
                          ) : (
                             <><Upload className="w-10 h-10 text-slate-100" /><span className="text-[10px] font-black uppercase tracking-widest">Digitize ID Photo</span></>
                          )}
                        </button>
                        
                        {newGuestForm.idFileData && (
                          <div className="w-full sm:w-44 aspect-[3/4] bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative group">
                             <img src={newGuestForm.idFileData} className="w-full h-full object-cover opacity-80" />
                             <button type="button" onClick={() => setNewGuestForm({...newGuestForm, idFileData: null, idFileName: null})} className="absolute inset-0 bg-rose-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <Trash2 className="w-6 h-6 text-white" />
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Internal Operational Notes</label>
                  <textarea className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[120px]" placeholder="Food preferences, behavior notes, or guest requests..." value={newGuestForm.notes} onChange={e => setNewGuestForm({...newGuestForm, notes: e.target.value})} />
               </div>

               <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-all active:scale-[0.98]">Create Identity Profile</button>
             </form>
          </div>
        ) : selectedGuest ? (
          <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-6 duration-700">
            <div className="flex flex-col md:flex-row items-start gap-10 border-b border-slate-50 pb-14">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-5xl font-black text-indigo-600 border-8 border-white shadow-2xl overflow-hidden shrink-0">
                <img src={selectedGuest.avatar} alt={selectedGuest.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-8 pt-2">
                <div>
                   <div className="flex items-center flex-wrap gap-4">
                      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedGuest.name}</h1>
                      {selectedGuest.idFileData && (
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                           <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                         </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-10 mt-10">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lifetime Revenue</p>
                          <p className="text-3xl font-black text-emerald-600 tracking-tighter">₹{getGuestLifetimeRevenue(selectedGuest.id).toLocaleString('en-IN')}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filing Status</p>
                          <p className="text-sm font-black text-slate-900 uppercase bg-slate-50 px-4 py-2 rounded-xl inline-block">{selectedGuest.totalStays > 0 ? 'Returning Client' : 'New Prospect'}</p>
                       </div>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => { if(confirm("Permanently wipe this identity from the ledger?")) onDeleteGuest(selectedGuest.id); }}
                className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all self-start"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-14 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                  <CreditCard className="w-6 h-6 text-indigo-500" />
                  Verification Artifact
                </h3>
                <div className="relative">
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleIdUpload} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white hover:bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {selectedGuest.idFileData ? 'Update Artifact' : 'Digitize Credentials'}
                  </button>
                </div>
              </div>

              {selectedGuest.idFileData ? (
                <div className="relative group rounded-[3rem] overflow-hidden border-8 border-white bg-slate-50 aspect-video flex items-center justify-center shadow-2xl">
                  <img 
                    src={selectedGuest.idFileData} 
                    alt="Guest ID Proof" 
                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedGuest.idFileData!;
                        link.download = `HF_ID_${selectedGuest.name.replace(/\s+/g, '_')}.jpg`;
                        link.click();
                      }}
                      className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Download className="w-5 h-5" /> Download Dossier Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-20 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center gap-5 bg-slate-50/30">
                   <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-100 transition-all hover:scale-110"><Upload className="w-10 h-10" /></div>
                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No Credentials Documented</p>
                </div>
              )}
            </div>

            <div className="mt-14 space-y-6">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                 <Receipt className="w-6 h-6 text-emerald-500" />
                 Operational Dossier
               </h3>
               <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 min-h-[160px]">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    {selectedGuest.notes || 'No administrative observations have been filed for this identity profile.'}
                  </p>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-[4rem] border border-slate-100 p-24 text-center space-y-10 shadow-sm">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100 shadow-inner"><Users className="w-16 h-16" /></div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Access Controls</h3>
              <p className="text-slate-400 text-[10px] font-black mt-4 uppercase tracking-[0.3em] max-w-xs mx-auto leading-loose">Select a verified identity from the ledger to view operational dossiers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
