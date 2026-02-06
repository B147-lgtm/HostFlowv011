
import React, { useState } from 'react';
import { StaffLog, Transaction, TransactionType, ExpenseCategory, Guest, PropertyConfig, Booking, StayPackage } from '../types';
import { 
  Plus, 
  Utensils,
  CheckCircle2,
  Zap,
  ShoppingBasket,
  FileText,
  Briefcase,
  X,
  Eye,
  Receipt,
  TableProperties,
  ShieldCheck,
  Trash2,
  Home,
  Star,
  Settings2,
  Github,
  Terminal,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';

interface StaffPortalProps {
  propertyName: string;
  guests: Guest[];
  property: PropertyConfig;
  staffLogs: StaffLog[];
  onAddTransaction: (t: Transaction) => void;
  bookings: Booking[];
  transactions: Transaction[];
  stayPackages: StayPackage[];
  onUpdatePackages: (packages: StayPackage[]) => void;
}

const StaffPortal: React.FC<StaffPortalProps> = ({ 
  propertyName, guests, property, staffLogs, onAddTransaction, bookings, transactions, stayPackages, onUpdatePackages 
}) => {
  const [activeTab, setActiveTab] = useState<'service' | 'expense' | 'reporting' | 'config'>('service');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [showDeployHelp, setShowDeployHelp] = useState(false);

  const [serviceForm, setServiceForm] = useState({ guestId: '', name: '', amount: '', type: 'Food & Beverage' });
  const [expenseForm, setExpenseForm] = useState({ item: '', amount: '', category: ExpenseCategory.RESTOCK });

  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackage, setNewPackage] = useState<Omit<StayPackage, 'id'>>({
    title: '',
    desc: '',
    iconType: 'home'
  });

  const expensesOnly = transactions.filter(t => t.type === TransactionType.EXPENSE);

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: `svc-${Date.now()}`,
      propertyId: property.id,
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.INCOME,
      category: 'Additional Service',
      amount: Number(serviceForm.amount),
      description: `${serviceForm.name} (${serviceForm.type})`,
      referenceId: serviceForm.guestId,
      staffName: 'Staff Portal'
    };
    onAddTransaction(transaction);
    setSuccessMsg('Service billed to guest ledger!');
    setServiceForm({ guestId: '', name: '', amount: '', type: 'Food & Beverage' });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: `exp-${Date.now()}`,
      propertyId: property.id,
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      description: `Expansion Expense: ${expenseForm.item}`,
      staffName: 'Staff Portal'
    };
    onAddTransaction(transaction);
    setSuccessMsg('Expense successfully logged!');
    setExpenseForm({ item: '', amount: '', category: ExpenseCategory.RESTOCK });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const p: StayPackage = {
      ...newPackage,
      id: `pkg-${Date.now()}`
    };
    onUpdatePackages([...stayPackages, p]);
    setIsAddingPackage(false);
    setNewPackage({ title: '', desc: '', iconType: 'home' });
    setSuccessMsg('New stay package created!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Delete this stay package category? It will no longer appear at the Reception Desk.")) {
      onUpdatePackages(stayPackages.filter(p => p.id !== id));
    }
  };

  const handleGenerateReport = (guest: Guest) => {
    const guestTransactions = transactions.filter(t => t.referenceId === guest.id);
    const guestBookings = bookings.filter(b => b.guestId === guest.id);
    const totalExtra = guestTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const totalBooking = guestBookings.reduce((s, b) => s + b.totalPrice, 0);
    
    const finalReport = `
STAY DOSSIER: ${propertyName.toUpperCase()}
=========================================
GUEST IDENTITY: ${guest.name.toUpperCase()}
CONTACT: ${guest.phone}
STAY PERIOD: ${guest.lastStay}

FINANCIAL RECONCILIATION:
-------------------------
Room Base Charges:    ₹${totalBooking.toLocaleString('en-IN')}
Additional Services:  ₹${totalExtra.toLocaleString('en-IN')}
=========================================
TOTAL RECEIVABLE:     ₹${(totalBooking + totalExtra).toLocaleString('en-IN')}

OPERATIONAL SUMMARY:
Standard check-out reconciliation complete. Guest has settled all dues as per the in-house service ledger.

STATUS: CLEAR & ARCHIVED
=========================================
Generated on: ${new Date().toLocaleString()}
    `;

    setActiveReport(finalReport);
  };

  const getPackageIcon = (type: string) => {
    switch(type) {
      case 'star': return <Star className="w-5 h-5" />;
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Staff Portal</h1>
            <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">{propertyName} • Internal Management</p>
          </div>
        </div>
      </div>

      <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm gap-2">
        <button onClick={() => setActiveTab('service')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'service' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <Zap className="w-4 h-4" /> Service Log
        </button>
        <button onClick={() => setActiveTab('expense')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <ShoppingBasket className="w-4 h-4" /> Expense Log
        </button>
        <button onClick={() => setActiveTab('reporting')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'reporting' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <TableProperties className="w-4 h-4" /> Reporting Sheet
        </button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'config' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <Settings2 className="w-4 h-4" /> Context Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px]">
            {activeTab === 'service' && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Utensils className="w-6 h-6" /></div>
                  <div><h2 className="text-xl font-black uppercase tracking-tight">Direct Bill Service</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Post income to in-house guest ledgers</p></div>
                </div>
                {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> {successMsg}</div>}
                <form onSubmit={handleServiceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Active Guest</label>
                      <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={serviceForm.guestId} onChange={e => setServiceForm({...serviceForm, guestId: e.target.value})}>
                        <option value="">Select In-House Resident</option>
                        {guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount (₹)</label>
                      <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-emerald-600 outline-none" value={serviceForm.amount} onChange={e => setServiceForm({...serviceForm, amount: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Service Description</label>
                    <input required type="text" placeholder="e.g. Organic Breakfast, Laundry, Guided Tour" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-[0.98]">Bill Extra Service</button>
                </form>
              </div>
            )}

            {activeTab === 'expense' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><ShoppingBasket className="w-6 h-6" /></div>
                  <div><h2 className="text-xl font-black uppercase tracking-tight">Expense Entry</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Track procurement and property overheads</p></div>
                </div>
                {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> {successMsg}</div>}
                <form onSubmit={handleExpenseSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value as any})}>
                        <option value={ExpenseCategory.RESTOCK}>Restock & Inventory</option>
                        <option value={ExpenseCategory.KITCHEN_SUPPLIES}>Kitchen Supplies</option>
                        <option value={ExpenseCategory.MAINTENANCE}>Property Maintenance</option>
                        <option value={ExpenseCategory.UTILITIES}>Utility Bills</option>
                        <option value={ExpenseCategory.MISC}>Miscellaneous</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount (₹)</label>
                      <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-rose-600 outline-none" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Expense Details / Vendor</label>
                    <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none min-h-[100px]" value={expenseForm.item} onChange={e => setExpenseForm({...expenseForm, item: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-[0.98]">Record Expense</button>
                </form>
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="animate-in fade-in duration-500 space-y-10">
                <div>
                   <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><FileText className="w-6 h-6" /></div>
                     <div><h2 className="text-xl font-black uppercase tracking-tight">Reporting Sheet</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Auditor Ledger & Stay Dossiers</p></div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-2">Expense Ledger (INR)</h3>
                      {expensesOnly.length === 0 ? (
                        <div className="p-8 text-center text-slate-300 italic border border-dashed rounded-[2rem]">No expansion expenses logged.</div>
                      ) : (
                        <div className="space-y-2">
                          {expensesOnly.map(exp => (
                            <div key={exp.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><Receipt className="w-4 h-4" /></div>
                                  <div>
                                     <p className="text-xs font-black uppercase text-slate-900 leading-tight">{exp.description}</p>
                                     <p className="text-[9px] text-slate-500 font-bold uppercase">{exp.date} • {exp.category}</p>
                                  </div>
                               </div>
                               <span className="text-sm font-black text-rose-600">₹{exp.amount.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between mt-4">
                             <span className="text-[10px] font-black uppercase tracking-widest">Total Expenses Recorded</span>
                             <span className="text-lg font-black text-emerald-400">₹{expensesOnly.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="pt-10 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-2 mb-4">Client Stay Dossiers</h3>
                  <div className="space-y-4">
                    {guests.map(guest => (
                      <div key={guest.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-indigo-500">{guest.name.charAt(0)}</div>
                             <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs">{guest.name}</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{guest.lastStay} • {guest.totalStays} Stays Registered</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleGenerateReport(guest)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
                          >
                             <Eye className="w-3 h-3" />
                             View Dossier
                          </button>
                      </div>
                    ))}
                  </div>
                </div>

                {activeReport && (
                  <div className="mt-10 p-8 bg-slate-950 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden animate-in zoom-in-95 border-2 border-emerald-500/20">
                    <button onClick={() => setActiveReport(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                    <div className="flex items-center gap-3 text-emerald-400 mb-4 font-black uppercase text-[10px] tracking-widest"><ShieldCheck className="w-4 h-4" /> Cloud Verified Identity Report</div>
                    <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-slate-300 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-inner">
                      {activeReport}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Settings2 className="w-6 h-6" /></div>
                    <div><h2 className="text-xl font-black uppercase tracking-tight">Stay Context Config</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Manage reception desk packages</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeployHelp(true)} className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                      <Github className="w-4 h-4" /> Deploy Help
                    </button>
                    {!isAddingPackage && (
                      <button onClick={() => setIsAddingPackage(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Package
                      </button>
                    )}
                  </div>
                </div>

                {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> {successMsg}</div>}

                {isAddingPackage && (
                  <div className="mb-10 p-8 bg-slate-50 rounded-3xl border border-slate-200 animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Configure New Package</h3>
                      <button onClick={() => setIsAddingPackage(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <form onSubmit={handleAddPackage} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Package Title</label>
                          <input required type="text" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold" value={newPackage.title} onChange={e => setNewPackage({...newPackage, title: e.target.value})} placeholder="e.g. Garden Party Package" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Icon</label>
                          <select className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[10px]" value={newPackage.iconType} onChange={e => setNewPackage({...newPackage, iconType: e.target.value as any})}>
                            <option value="home">Property Icon</option>
                            <option value="star">Premium Star</option>
                            <option value="sparkles">Event Sparkles</option>
                            <option value="zap">Instant Zap</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
                        <textarea required className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold min-h-[100px]" value={newPackage.desc} onChange={e => setNewPackage({...newPackage, desc: e.target.value})} placeholder="Describe what is included in this stay category..." />
                      </div>
                      <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Activate Package in CRM</button>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Active Reception Desk Options</h3>
                  {stayPackages.length === 0 ? (
                    <div className="p-12 text-center text-slate-300 italic border-2 border-dashed rounded-[3rem]">No packages configured. Guests will have no checkout options.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {stayPackages.map(pkg => (
                        <div key={pkg.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                {getPackageIcon(pkg.iconType)}
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{pkg.title}</h4>
                                 <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-1 max-w-md truncate">{pkg.desc}</p>
                              </div>
                           </div>
                           <button onClick={() => handleDeletePackage(pkg.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl h-full flex flex-col relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Briefcase className="w-32 h-32 text-emerald-400" />
            </div>
            <h2 className="relative z-10 text-lg font-black flex items-center gap-3 uppercase tracking-tight mb-8">Account Activity Log</h2>
            <div className="relative z-10 space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {staffLogs.length === 0 ? (
                <div className="py-12 text-center opacity-30 italic text-xs">Waiting for operations...</div>
              ) : (
                staffLogs.map(log => (
                  <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${log.type === 'FINANCIAL' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.type}</span>
                    </div>
                    <p className="text-xs font-bold leading-tight">{log.action}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">{log.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* GitHub Deployment Help Modal */}
      {showDeployHelp && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Update Website</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Sync Code to GitHub</p>
                  </div>
                </div>
                <button onClick={() => setShowDeployHelp(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                  <X className="w-8 h-8" />
                </button>
             </div>
             <div className="p-10 space-y-8">
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                  <Info className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
                  <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                    The <span className="font-black">Sync Icon</span> in the app only handles <span className="font-black">GUEST DATA</span>. To update the website layout or buttons, you must run these commands on your computer.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-2 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Terminal Commands
                  </h3>
                  <div className="bg-slate-900 p-6 rounded-3xl text-emerald-400 font-mono text-xs space-y-3 shadow-inner">
                    <p># 1. Open your terminal in the app folder</p>
                    <p className="text-white">git add .</p>
                    <p className="text-white">git commit -m "Update website features"</p>
                    <p className="text-white">git push origin main</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <a href="https://github.com" target="_blank" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                    Open GitHub Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => setShowDeployHelp(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Close Guide</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPortal;
