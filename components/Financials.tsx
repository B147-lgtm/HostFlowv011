
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TransactionType, ExpenseCategory, Transaction } from '../types';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt, 
  Trash2, 
  Plus, 
  Edit2, 
  X, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowRightCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

interface FinancialsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Financials: React.FC<FinancialsProps> = ({ transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.INCOME,
    category: 'Booking',
    amount: '',
    description: ''
  });

  const totalIncome = useMemo(() => transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  const totalExpenses = useMemo(() => transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const profit = totalIncome - totalExpenses;

  const expenseByCategory = useMemo(() => Object.values(ExpenseCategory).map(cat => ({
    name: cat,
    value: transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0)
  })).filter(c => c.value > 0), [transactions]);

  const chartData = useMemo(() => {
    // Basic chart data logic
    return [
      { name: 'Week 1', income: totalIncome * 0.2, expense: totalExpenses * 0.15 },
      { name: 'Week 2', income: totalIncome * 0.25, expense: totalExpenses * 0.25 },
      { name: 'Week 3', income: totalIncome * 0.15, expense: totalExpenses * 0.3 },
      { name: 'Week 4', income: totalIncome * 0.4, expense: totalExpenses * 0.3 },
    ];
  }, [totalIncome, totalExpenses]);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.INCOME,
      category: 'Booking',
      amount: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
      date: t.date,
      type: t.type,
      category: t.category as string,
      amount: t.amount.toString(),
      description: t.description
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: editingTransaction ? editingTransaction.id : `t-${Date.now()}`,
      propertyId: editingTransaction?.propertyId || '', // Fixed: Added propertyId placeholder (handled by App.tsx)
      date: formData.date,
      type: formData.type,
      category: formData.category as any,
      amount: Number(formData.amount),
      description: formData.description,
      referenceId: editingTransaction?.referenceId
    };

    if (editingTransaction) {
      onUpdateTransaction(transaction);
    } else {
      onAddTransaction(transaction);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
            <Wallet className="w-8 h-8 text-emerald-600" />
            Financials (INR)
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-[2px]">Manual Entry & Rectification Ledger</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
             <ArrowUpRight className="w-20 h-20 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <ArrowUpRight className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Income</span>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
             <ArrowDownRight className="w-20 h-20 text-rose-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <ArrowDownRight className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</span>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Wallet className="w-20 h-20 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">₹{profit.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Master Ledger</h2>
          <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{transactions.length} Records filed</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase tracking-[3px] font-black border-b border-slate-100">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6">Classification</th>
                <th className="px-10 py-6 text-right">Magnitude (INR)</th>
                <th className="px-10 py-6 text-right">Rectification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-30">
                      <Receipt className="w-16 h-16 text-slate-200" />
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Ledger Empty</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Begin manual filing using the "New Entry" button.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-7">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Calendar className="w-4 h-4 opacity-50" />
                          <span className="text-xs font-black tracking-tighter">{t.date}</span>
                       </div>
                    </td>
                    <td className="px-10 py-7">
                      <p className="font-black text-slate-900 tracking-tight text-sm uppercase">{t.description}</p>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                        t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-10 py-7 text-right font-black text-lg tracking-tighter ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-10 py-7 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(t)}
                            className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Rectify Entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                               if(confirm("Permanently delete this financial record?")) {
                                 onDeleteTransaction(t.id);
                               }
                            }}
                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${editingTransaction ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                    {editingTransaction ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {editingTransaction ? 'Rectify Entry' : 'New Manual Entry'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ledger Update</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                  <X className="w-8 h-8" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, type: TransactionType.INCOME, category: 'Booking'})}
                     className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Income
                   </button>
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, type: TransactionType.EXPENSE, category: ExpenseCategory.CLEANING})}
                     className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Expense
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                        <input 
                          required
                          type="date" 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                          {formData.type === TransactionType.INCOME ? (
                            <>
                              <option value="Booking">Booking Payment</option>
                              <option value="Additional Service">Additional Service</option>
                              <option value="Misc Income">Misc Income</option>
                            </>
                          ) : (
                            Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
                          )}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (INR)</label>
                      <div className="relative">
                         <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                         <input 
                           required
                           type="number" 
                           className={`w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl ${formData.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}
                           placeholder="0.00"
                           value={formData.amount}
                           onChange={e => setFormData({...formData, amount: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filing Description</label>
                      <textarea 
                         required
                         className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="e.g., Weekly laundry service or Room rent collection"
                         value={formData.description}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                   </div>
                </div>

                <button type="submit" className={`w-full py-5 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  {editingTransaction ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRightCircle className="w-5 h-5" />}
                  {editingTransaction ? 'Confirm Rectification' : 'Post to Ledger'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
