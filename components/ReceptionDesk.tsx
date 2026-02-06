
import React, { useState, useMemo, useRef } from 'react';
import { Booking, BookingStatus, Guest, Transaction, TransactionType } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Car, 
  Users, 
  Calendar, 
  CheckCircle2, 
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
  Package,
  Star,
  X,
  Sparkles,
  Banknote
} from 'lucide-react';

interface GroupGuest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idType: string;
  idNumber: string;
  idFileName: string | null;
  isPrimary: boolean;
}

interface ReceptionDeskProps {
  onCheckInComplete: (b: Booking, t: Transaction, guests: Guest[]) => void;
  propertyName: string;
}

const ReceptionDesk: React.FC<ReceptionDeskProps> = ({ onCheckInComplete, propertyName }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeGuestIndex, setActiveGuestIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with the Primary Guest
  const [guests, setGuests] = useState<GroupGuest[]>([
    {
      id: `g-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      idFileName: null,
      isPrimary: true
    }
  ]);

  const [stayDetails, setStayDetails] = useState({
    vehicleNumber: '',
    packageType: 'Basic 8-Room Stay',
    checkOut: '',
    amount: '',
    agreeRules: false
  });

  const packageOptions = [
    {
      id: 'Basic 8-Room Stay',
      title: 'Basic 8-Room Stay',
      desc: 'Full access to 8 guest rooms, gardens, and standard farm common areas.',
      icon: Home
    },
    {
      id: 'Suite Upgrade',
      title: '8-Room + Presidential Suite',
      desc: 'Includes 8 guest rooms plus the premium Presidential suite with luxury amenities.',
      icon: Star
    },
    {
      id: 'Event Plus',
      title: 'Garden Charges Plus Accommodation',
      desc: 'Full accommodation along with garden venue access and event setup permissions.',
      icon: Sparkles
    }
  ];

  const addGuest = () => {
    if (guests.length >= 25) return;
    const newGuest: GroupGuest = {
      id: `g-${Date.now()}-${guests.length}`,
      name: '',
      phone: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      idFileName: null,
      isPrimary: false
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
    const newList = [...guests];
    newList[index] = { ...newList[index], ...fields };
    setGuests(newList);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateGuest(index, { idFileName: file.name });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadedCount = guests.filter(g => g.idFileName).length;
  
  const isAllIdCaptured = useMemo(() => {
    return guests.every((g, idx) => {
      if (idx === 0) {
        return g.name && g.phone && g.email && g.idNumber && g.idFileName;
      }
      return g.name && g.idFileName;
    });
  }, [guests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const primary = guests.find(g => g.isPrimary)!;
    const bookingId = `book-${Date.now()}`;
    const primaryGuestId = `pid-${Date.now()}`;
    
    const crmGuests: Guest[] = guests.map((g, idx) => ({
      id: g.isPrimary ? primaryGuestId : `gid-${Date.now()}-${idx}`,
      propertyId: '', // Fixed: Added missing propertyId placeholder (handled by App.tsx)
      name: g.name,
      email: g.email || '',
      phone: g.phone || '',
      rating: 5,
      totalStays: 1,
      lastStay: new Date().toISOString().split('T')[0],
      notes: g.isPrimary ? `Primary for group of ${guests.length}. ${stayDetails.packageType}` : `Part of ${primary.name}'s group. ID Verified: ${g.idFileName}`,
      avatar: `https://picsum.photos/seed/${g.id}/100/100`,
      idType: g.idType,
      idNumber: g.idNumber,
      vehicleNumber: g.isPrimary ? stayDetails.vehicleNumber : undefined
    }));

    const newBooking: Booking = {
      id: bookingId,
      propertyId: '', // Fixed: Added missing propertyId placeholder (handled by App.tsx)
      guestId: primaryGuestId,
      guestName: primary.name,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: stayDetails.checkOut,
      status: BookingStatus.CHECKED_IN,
      totalPrice: Number(stayDetails.amount),
      guestsCount: guests.length,
      source: 'Direct',
      cottageName: stayDetails.packageType
    };

    const newTransaction: Transaction = {
      id: `trans-${Date.now()}`,
      propertyId: '', // Fixed: Added missing propertyId placeholder (handled by App.tsx)
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.INCOME,
      category: 'Booking',
      amount: Number(stayDetails.amount),
      description: `Package: ${stayDetails.packageType} for ${primary.name}`
    };

    onCheckInComplete(newBooking, newTransaction, crmGuests);
    setIsSuccess(true);
  };

  const resetCounter = () => {
    setStep(1);
    setIsSuccess(false);
    setGuests([{
      id: `g-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      idFileName: null,
      isPrimary: true
    }]);
    setStayDetails({
      vehicleNumber: '',
      packageType: 'Basic 8-Room Stay',
      checkOut: '',
      amount: '',
      agreeRules: false
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Check-in Finalized!</h1>
        <p className="text-xl text-slate-500 mb-12 font-medium">
          Group registered successfully under <span className="text-slate-900 font-bold">{guests[0].name}</span>.<br/>
          Total <span className="text-emerald-600 font-bold">{guests.length} members</span> checked in.
        </p>
        <button 
          onClick={resetCounter}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          New Group Check-in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-in Counter</h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Group Registration • {propertyName}</p>
          </div>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Repository</p>
            <p className="text-lg font-black text-slate-900">{uploadedCount} <span className="text-slate-300 font-medium">/</span> {guests.length}</p>
          </div>
          <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-emerald-500 transition-all duration-700" 
               style={{ width: `${(uploadedCount / guests.length) * 100}%` }}
             />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Progress Bar Header */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {[
            { n: 1, l: 'Guest IDs' },
            { n: 2, l: 'Packages' },
            { n: 3, l: 'Agreement' }
          ].map((s) => (
            <div 
              key={s.n}
              className={`flex-1 p-6 text-center font-bold text-xs uppercase tracking-widest border-r border-slate-100 transition-colors last:border-0 ${
                step === s.n ? 'bg-white text-indigo-600' : 'text-slate-400'
              }`}
            >
              Step {s.n}: {s.l}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 flex-1">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                    Identity Collection
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">ID photo attachment is mandatory for every registered guest.</p>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">Group Support: 25 Max</span>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {guests.map((guest, idx) => (
                  <div 
                    key={guest.id} 
                    className={`border-2 rounded-3xl transition-all ${
                      activeGuestIndex === idx ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <button 
                      type="button"
                      onClick={() => setActiveGuestIndex(idx)}
                      className="w-full p-6 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                          guest.idFileName ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {guest.idFileName ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className={`font-black uppercase tracking-tight truncate ${guest.name ? 'text-slate-900' : 'text-slate-400'}`}>
                            {guest.name || (guest.isPrimary ? "Primary Guest" : `Guest #${idx + 1}`)}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {guest.isPrimary ? "Booking Manager" : "Group Member"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {!guest.isPrimary && (
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removeGuest(idx); }}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {activeGuestIndex === idx ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                      </div>
                    </button>

                    {activeGuestIndex === idx && (
                      <div className="px-6 pb-8 pt-2 border-t border-indigo-100/30 space-y-6 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className={`space-y-2 ${idx > 0 ? 'md:col-span-2' : ''}`}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                required
                                type="text" 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                                placeholder="Enter Full Name"
                                value={guest.name}
                                onChange={e => updateGuest(idx, { name: e.target.value })}
                              />
                            </div>
                          </div>

                          {idx === 0 && (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    required
                                    type="tel" 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={guest.phone}
                                    onChange={e => updateGuest(idx, { phone: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    required
                                    type="email" 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    placeholder="email@example.com"
                                    value={guest.email}
                                    onChange={e => updateGuest(idx, { email: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Type</label>
                                <div className="relative">
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <select 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                                    value={guest.idType}
                                    onChange={e => updateGuest(idx, { idType: e.target.value })}
                                  >
                                    <option>Aadhar Card</option>
                                    <option>Passport</option>
                                    <option>Driving License</option>
                                    <option>Voter ID</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Card Number</label>
                                 <input 
                                   required
                                   type="text" 
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
                                   placeholder="XXXX-XXXX-XXXX"
                                   value={guest.idNumber}
                                   onChange={e => updateGuest(idx, { idNumber: e.target.value })}
                                 />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="relative group">
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(idx, e)}
                          />
                          <button 
                            type="button"
                            onClick={triggerFileInput}
                            className={`w-full py-8 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-3 ${
                              guest.idFileName ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-400 hover:bg-white'
                            }`}
                          >
                             {guest.idFileName ? (
                               <>
                                 <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                   <FileText className="w-6 h-6" />
                                 </div>
                                 <div className="text-center">
                                   <p className="font-bold">ID Document Attached</p>
                                   <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mt-1">{guest.idFileName}</p>
                                 </div>
                                 <button 
                                   type="button"
                                   onClick={(e) => { e.stopPropagation(); updateGuest(idx, { idFileName: null }); }}
                                   className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm border border-emerald-100 text-emerald-400 hover:text-rose-500 transition-all"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <Upload className="w-10 h-10 text-slate-300" />
                                 <p className="font-bold">Click to Upload Guest ID Photo</p>
                                 <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Supported: JPG, PNG, PDF (Mandatory)</span>
                               </>
                             )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {guests.length < 25 && (
                  <button 
                    type="button"
                    onClick={addGuest}
                    className="w-full py-6 border-2 border-dashed border-indigo-200 rounded-[2.5rem] text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest"
                  >
                    <Plus className="w-6 h-6" />
                    Register Additional Guest
                  </button>
                )}
              </div>

              {!isAllIdCaptured && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <p className="text-xs font-bold text-rose-600">
                    ID Document attachment is missing for one or more guests. Please select a file to continue.
                  </p>
                </div>
              )}

              <button 
                type="button" 
                disabled={!isAllIdCaptured}
                onClick={() => setStep(2)}
                className="w-full py-5 bg-indigo-600 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                Proceed to Stay Packages
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Select Farm Stay Package
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {packageOptions.map((opt) => (
                     <button
                       key={opt.id}
                       type="button"
                       onClick={() => setStayDetails({...stayDetails, packageType: opt.id})}
                       className={`p-6 rounded-[2.5rem] border-2 text-left transition-all relative group flex flex-col ${
                         stayDetails.packageType === opt.id ? 'border-indigo-500 bg-indigo-50/20 shadow-lg' : 'border-slate-100 hover:border-indigo-200'
                       }`}
                     >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                         stayDetails.packageType === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                       }`}>
                         <opt.icon className="w-6 h-6" />
                       </div>
                       <h4 className="font-black text-slate-900 text-base leading-tight mb-2 uppercase tracking-tight">{opt.title}</h4>
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 flex-1">{opt.desc}</p>
                       <div className="flex justify-end mt-auto">
                         {stayDetails.packageType === opt.id && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negotiated Amount (₹)</label>
                  <div className="relative">
                    <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      type="number" 
                      placeholder="Total Stay Price"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-lg placeholder:text-slate-300"
                      value={stayDetails.amount}
                      onChange={e => setStayDetails({...stayDetails, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Vehicle Plate</label>
                  <div className="relative">
                    <Car className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g., DL 3C AE 1234"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                      value={stayDetails.vehicleNumber}
                      onChange={e => setStayDetails({...stayDetails, vehicleNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      type="date" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                      value={stayDetails.checkOut}
                      onChange={e => setStayDetails({...stayDetails, checkOut: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 transition-all">Edit IDs</button>
                <button 
                  type="button" 
                  disabled={!stayDetails.checkOut || !stayDetails.amount}
                  onClick={() => setStep(3)}
                  className="flex-2 w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  Final Summary
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Legal Signature & Terms</h3>
                </div>
                
                <div className="text-sm text-slate-300 leading-relaxed font-medium h-64 overflow-y-auto pr-6 custom-scrollbar border-y border-white/10 py-6">
                  <p className="text-emerald-400 font-black uppercase tracking-widest mb-4">Master Guest Declaration</p>
                  <p className="mb-4">I, <span className="text-white font-bold">{guests[0].name}</span>, hereby sign on behalf of this party of {guests.length} members for the <span className="text-indigo-400 font-black">{stayDetails.packageType}</span> at the agreed price of <span className="text-emerald-400 font-black">₹{Number(stayDetails.amount).toLocaleString('en-IN')}</span>:</p>
                  <ul className="list-disc pl-5 mb-6 space-y-2">
                    {guests.map((g, i) => (
                      <li key={i} className="text-xs">
                        {g.name} {i === 0 ? `(ID: ${g.idNumber})` : `(ID Verified: ${g.idFileName})`}
                      </li>
                    ))}
                  </ul>
                  <p className="mb-4">1. I accept full liability for any property damage caused by any member of my party during our stay at {propertyName}.</p>
                  <p className="mb-4">2. I acknowledge that {propertyName} is a working farm with natural hazards. We agree to follow all safety signage and staff instructions.</p>
                  <p className="mb-4">3. We confirm that the digital ID photo uploads provided in Step 1 are true and accurate representations of all guests.</p>
                  <p className="mb-4">4. No outside guests are permitted after 10 PM. No loud music in farm open areas at night.</p>
                  <p className="italic text-slate-400 mt-8">By checking the box below, you provide a binding digital signature as the Primary Guest.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <label className="flex items-center gap-6 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="w-8 h-8 rounded-xl bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500"
                        checked={stayDetails.agreeRules}
                        onChange={e => setStayDetails({...stayDetails, agreeRules: e.target.checked})}
                      />
                    </div>
                    <div>
                      <span className="font-black text-lg block uppercase tracking-tight">Accept & Digitally Sign</span>
                      <span className="text-xs text-slate-400 font-medium">I attest that the group ID database is complete and accurate.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 transition-all">Back</button>
                <button 
                  type="submit" 
                  disabled={!stayDetails.agreeRules}
                  className="flex-2 w-full py-5 bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-4"
                >
                  Complete Check-in
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReceptionDesk;
