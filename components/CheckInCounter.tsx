
import React, { useState, useMemo, useRef } from 'react';
import { Booking, BookingStatus, Guest, Transaction, TransactionType, StayPackage } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Car, 
  Users, 
  Calendar, 
  CircleCheck, 
  Home,
  ShieldCheck,
  ClipboardCheck,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TriangleAlert,
  Package,
  Star,
  X,
  Sparkles,
  Banknote,
  Loader2,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface GroupGuest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idType: string;
  idNumber: string;
  idFileName: string | null;
  idFileData: string | null;
  isPrimary: boolean;
  isProcessing?: boolean;
}

interface CheckInCounterProps {
  onCheckInComplete: (b: Booking, t: Transaction, guests: Guest[]) => void;
  propertyName: string;
  stayPackages: StayPackage[];
}

const CheckInCounter: React.FC<CheckInCounterProps> = ({ onCheckInComplete, propertyName, stayPackages }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeGuestIndex, setActiveGuestIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [guests, setGuests] = useState<GroupGuest[]>([
    {
      id: `g-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      idFileName: null,
      idFileData: null,
      isPrimary: true,
      isProcessing: false
    }
  ]);

  const [stayDetails, setStayDetails] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    packageType: stayPackages[0]?.title || 'Standard Stay',
    checkOut: '',
    amount: '',
    agreeRules: false
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

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateGuest(index, { isProcessing: true });
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const rawBase64 = reader.result as string;
          const optimizedBase64 = await compressImage(rawBase64);
          updateGuest(index, { 
            idFileName: file.name,
            idFileData: optimizedBase64,
            isProcessing: false
          });
        } catch (err) {
          console.error("Compression failed", err);
          updateGuest(index, { isProcessing: false });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addGuest = () => {
    if (guests.length >= 25) return;
    const newGuest: GroupGuest = {
      id: `g-${Date.now()}-${guests.length}`,
      name: '', phone: '', email: '', idType: 'Aadhar Card', idNumber: '', idFileName: null, idFileData: null, isPrimary: false, isProcessing: false
    };
    setGuests([...guests, newGuest]);
    setActiveGuestIndex(guests.length);
  };

  const removeGuest = (index: number) => {
    if (guests[index].isPrimary) return;
    const newList = [...guests];
    newList.splice(index, 1);
    setGuests(newList);
    setActiveGuestIndex(0);
  };

  const updateGuest = (index: number, fields: Partial<GroupGuest>) => {
    setGuests(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], ...fields };
      return newList;
    });
  };

  const isAllIdCaptured = useMemo(() => {
    return guests.every((g, idx) => {
      if (idx === 0) {
        return g.name && g.phone && g.idNumber && g.idFileData && stayDetails.checkInDate;
      }
      return g.name && g.idFileData;
    });
  }, [guests, stayDetails.checkInDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primary = guests.find(g => g.isPrimary)!;
    const primaryGuestId = `pid-${Date.now()}`;
    
    const crmGuests: Guest[] = guests.map((g, idx) => ({
      id: g.isPrimary ? primaryGuestId : `gid-${Date.now()}-${idx}`,
      propertyId: '', 
      name: g.name.toUpperCase(),
      email: g.email || '',
      phone: g.phone || '',
      rating: 5,
      totalStays: 1,
      lastStay: stayDetails.checkInDate,
      notes: g.isPrimary ? `Primary for group of ${guests.length}. ${stayDetails.packageType}` : `Part of ${primary.name}'s group.`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.id}`,
      idType: g.idType,
      idNumber: g.idNumber,
      vehicleNumber: g.isPrimary ? stayDetails.vehicleNumber : undefined,
      idFileName: g.idFileName || undefined,
      idFileData: g.idFileData || undefined
    }));

    onCheckInComplete(
      {
        id: `book-${Date.now()}`,
        propertyId: '', 
        guestId: primaryGuestId,
        guestName: primary.name.toUpperCase(),
        checkIn: stayDetails.checkInDate,
        checkOut: stayDetails.checkOut,
        status: BookingStatus.CHECKED_IN,
        totalPrice: Number(stayDetails.amount),
        guestsCount: guests.length,
        source: 'Direct',
        cottageName: stayDetails.packageType
      },
      {
        id: `trans-${Date.now()}`,
        propertyId: '', 
        date: stayDetails.checkInDate,
        type: TransactionType.INCOME,
        category: 'Booking',
        amount: Number(stayDetails.amount),
        description: `Stay Package: ${stayDetails.packageType}`
      },
      crmGuests
    );
    setIsSuccess(true);
  };

  const resetCounter = () => {
    setStep(1); setIsSuccess(false);
    setGuests([{ id: `g-${Date.now()}`, name: '', phone: '', email: '', idType: 'Aadhar Card', idNumber: '', idFileName: null, idFileData: null, isPrimary: true, isProcessing: false }]);
    setStayDetails({ checkInDate: new Date().toISOString().split('T')[0], vehicleNumber: '', packageType: stayPackages[0]?.title || 'Standard Stay', checkOut: '', amount: '', agreeRules: false });
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-white"><CircleCheck className="w-12 h-12" /></div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Checked In</h1>
        <p className="text-slate-500 mb-12 font-bold uppercase text-[10px] tracking-[0.3em]">Ledger Updated • Credentials Synced</p>
        <button onClick={resetCounter} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">Reset Counter</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-inter">
      {/* Concierge Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Reception</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 ml-1 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Secure Group Registration • {propertyName}
          </p>
        </div>
        
        <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Vault Sync</p>
             <div className="flex items-center gap-2">
               <span className="text-2xl font-black text-slate-900">{guests.filter(g => g.idFileData).length}</span>
               <span className="text-slate-200 text-xl font-medium">/</span>
               <span className="text-lg font-black text-slate-300">{guests.length}</span>
             </div>
           </div>
           <div className="w-1.5 h-12 bg-slate-50 rounded-full overflow-hidden">
             <div 
               className="w-full bg-emerald-500 transition-all duration-1000" 
               style={{ height: `${(guests.filter(g => g.idFileData).length / guests.length) * 100}%` }}
             />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Modern Progress Tracker */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50/50">
          {[
            { n: '01', l: 'Guest Profiles' },
            { n: '02', l: 'Stay Package' },
            { n: '03', l: 'Legal Signing' }
          ].map((s, i) => (
            <div 
              key={i}
              className={`py-5 rounded-[2rem] text-center font-black uppercase transition-all duration-500 ${
                step === i + 1 
                  ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' 
                  : 'text-slate-300 opacity-60'
              }`}
            >
              <p className="text-[8px] tracking-[0.4em] mb-1">Phase {s.n}</p>
              <p className="text-[10px] tracking-widest">{s.l}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
              <div className="flex flex-col lg:flex-row gap-12">
                {/* Guest List Management */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Directory Entry</h3>
                    <button type="button" onClick={addGuest} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Member
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                    {guests.map((guest, idx) => (
                      <div 
                        key={guest.id}
                        className={`group border-2 rounded-[2rem] transition-all duration-300 ${
                          activeGuestIndex === idx ? 'border-indigo-600 bg-indigo-50/20 shadow-lg' : 'border-slate-50 bg-white hover:border-slate-100'
                        }`}
                      >
                        <div 
                          className="p-6 flex items-center justify-between cursor-pointer"
                          onClick={() => setActiveGuestIndex(idx)}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                              guest.idFileData ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                            }`}>
                              {guest.idFileData ? <CircleCheck className="w-6 h-6" /> : idx + 1}
                            </div>
                            <div>
                               <p className={`font-black uppercase tracking-tight text-sm ${guest.name ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                                 {guest.name || "Awaiting Identity"}
                               </p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                 {guest.isPrimary ? "Primary Tenant" : "Accompanying Guest"}
                               </p>
                            </div>
                          </div>
                          {!guest.isPrimary && activeGuestIndex === idx && (
                            <button onClick={(e) => { e.stopPropagation(); removeGuest(idx); }} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {activeGuestIndex === idx && (
                          <div className="px-6 pb-8 pt-2 border-t border-indigo-100/30 space-y-6 animate-in slide-in-from-top-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`space-y-1.5 ${!guest.isPrimary ? 'md:col-span-2' : ''}`}>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                                  <input required type="text" className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold uppercase text-xs focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" value={guest.name} onChange={e => updateGuest(idx, { name: e.target.value })} />
                                </div>
                                {guest.isPrimary && (
                                  <>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                      <input required type="tel" className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold text-xs outline-none" value={guest.phone} onChange={e => updateGuest(idx, { phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Number (Aadhar/Passport)</label>
                                      <input required type="text" className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase" value={guest.idNumber} onChange={e => updateGuest(idx, { idNumber: e.target.value })} />
                                    </div>
                                  </>
                                )}
                             </div>

                             <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Capture</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                   <button 
                                      type="button" 
                                      onClick={() => fileInputRef.current?.click()}
                                      className={`flex-1 py-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all ${
                                        guest.idFileData ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-indigo-400 hover:bg-white'
                                      }`}
                                    >
                                      {guest.isProcessing ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                      ) : guest.idFileData ? (
                                        <><CircleCheck className="w-10 h-10 text-emerald-500" /><p className="text-[9px] font-black uppercase tracking-widest">Captured</p></>
                                      ) : (
                                        <><Upload className="w-8 h-8 text-slate-200" /><p className="text-[9px] font-black uppercase tracking-widest">Select ID Photo</p></>
                                      )}
                                   </button>
                                   <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(idx, e)} />
                                   
                                   {guest.idFileData && (
                                     <div className="w-full sm:w-32 aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden border-2 border-white shadow-xl relative group">
                                        <img src={guest.idFileData} className="w-full h-full object-cover opacity-80" />
                                        <button onClick={() => updateGuest(idx, { idFileData: null, idFileName: null })} className="absolute inset-0 bg-rose-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <X className="w-6 h-6 text-white" />
                                        </button>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Global Config Sidebar */}
                <div className="w-full lg:w-72 space-y-6">
                   <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                      <div className="absolute top-0 right-0 p-8 opacity-5"><Calendar className="w-24 h-24" /></div>
                      <div className="relative z-10 space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                           <Calendar className="w-4 h-4 text-indigo-400" />
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Check-in Registry</h4>
                         </div>
                         <input required type="date" className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all text-xs" value={stayDetails.checkInDate} onChange={e => setStayDetails({...stayDetails, checkInDate: e.target.value})} />
                         <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">IDs will be pinned to this production date.</p>
                      </div>
                   </div>

                   <div className={`p-8 rounded-[3rem] border-2 transition-all duration-500 ${isAllIdCaptured ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <div className="flex items-start gap-4">
                        {isAllIdCaptured ? <CircleCheck className="w-6 h-6 text-emerald-600 shrink-0" /> : <TriangleAlert className="w-6 h-6 text-rose-500 shrink-0" />}
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isAllIdCaptured ? 'text-emerald-900' : 'text-rose-900'}`}>
                            {isAllIdCaptured ? 'Ready to Sync' : 'Capture Required'}
                          </p>
                          <p className="text-[9px] font-medium text-slate-500 mt-2 leading-relaxed">
                            {isAllIdCaptured ? 'All identification artifacts for this group have been digitized and scaled.' : 'Awaiting guest identification artifacts to satisfy production audit compliance.'}
                          </p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <button 
                  type="button" 
                  disabled={!isAllIdCaptured} 
                  onClick={() => setStep(2)} 
                  className="w-full py-6 bg-slate-900 disabled:opacity-30 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Enter Stay Tier Selection
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">Service Tier</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Select the active stay configuration for this group</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {stayPackages.map((opt) => {
                     const active = stayDetails.packageType === opt.title;
                     return (
                       <button 
                         key={opt.id} 
                         type="button" 
                         onClick={() => setStayDetails({...stayDetails, packageType: opt.title})} 
                         className={`relative p-8 rounded-[3rem] border-2 transition-all duration-500 text-left flex flex-col ${
                           active 
                             ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl scale-[1.02]' 
                             : 'border-slate-50 bg-white hover:border-indigo-100 hover:shadow-lg'
                         }`}
                       >
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                           active ? 'bg-white/20' : 'bg-slate-50'
                         }`}>
                           {opt.iconType === 'star' ? <Star className="w-6 h-6" /> : opt.iconType === 'sparkles' ? <Sparkles className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                         </div>
                         <h4 className="font-black text-lg leading-none mb-3 uppercase tracking-tighter">{opt.title}</h4>
                         <p className={`text-[11px] font-medium leading-relaxed mb-8 flex-1 ${active ? 'text-indigo-100' : 'text-slate-400'}`}>{opt.desc}</p>
                         <div className="flex justify-end">
                            {active && <CircleCheck className="w-7 h-7 text-white" />}
                         </div>
                       </button>
                     );
                   })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Banknote className="w-3.5 h-3.5" /> Total Quoted (₹)</label>
                   <input required type="number" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xl text-emerald-600 shadow-sm outline-none" value={stayDetails.amount} onChange={e => setStayDetails({...stayDetails, amount: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Car className="w-3.5 h-3.5" /> Vehicle Number</label>
                   <input type="text" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xl uppercase shadow-sm outline-none" placeholder="Plate No." value={stayDetails.vehicleNumber} onChange={e => setStayDetails({...stayDetails, vehicleNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Exit Date</label>
                   <input required type="date" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm shadow-sm outline-none" value={stayDetails.checkOut} onChange={e => setStayDetails({...stayDetails, checkOut: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="px-8 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Back</button>
                <button type="button" disabled={!stayDetails.checkOut || !stayDetails.amount} onClick={() => setStep(3)} className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3">Review Dossier <ArrowRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 max-w-2xl mx-auto">
               <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldCheck className="w-48 h-48" /></div>
                  <div className="relative z-10 space-y-8">
                     <div className="flex flex-col items-center text-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white"><ShieldCheck className="w-10 h-10" /></div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Stay Dossier</h3>
                     </div>

                     <div className="space-y-4 border-y border-white/10 py-8">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>Primary Resident</span>
                           <span className="text-white opacity-100">{guests[0].name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>Group Size</span>
                           <span className="text-white opacity-100">{guests.length} Registered Members</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>Stay Tier</span>
                           <span className="text-white opacity-100 text-indigo-400">{stayDetails.packageType}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>Receivable Amount</span>
                           <span className="text-xl text-emerald-400 opacity-100">₹{Number(stayDetails.amount).toLocaleString('en-IN')}</span>
                        </div>
                     </div>

                     <div className="flex items-start gap-6 bg-white/5 p-8 rounded-3xl border border-white/5 cursor-pointer" onClick={() => setStayDetails({...stayDetails, agreeRules: !stayDetails.agreeRules})}>
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${stayDetails.agreeRules ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/20'}`}>
                           {stayDetails.agreeRules && <CircleCheck className="w-6 h-6" />}
                        </div>
                        <div>
                           <p className="font-black text-sm uppercase tracking-tight">Authorize Digital Entry</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">I verify that all identification artifacts are accurate.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Edit Tier</button>
                  <button type="submit" disabled={!stayDetails.agreeRules} className="flex-1 py-6 bg-emerald-600 disabled:opacity-30 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3">Sync to Master Ledger <CircleCheck className="w-5 h-5" /></button>
               </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CheckInCounter;
