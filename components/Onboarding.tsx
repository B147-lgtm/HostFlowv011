
import React, { useState } from 'react';
import { PropertyConfig } from '../types';
import { TreePine, User, Home, Sparkles, ArrowRight, Loader2, Mail, Phone } from 'lucide-react';

interface OnboardingProps {
  onComplete: (config: PropertyConfig) => void;
  isModal?: boolean;
  defaultManager?: { name: string; email: string; phone: string };
}

// Fixed the missing return statement and truncated content for Onboarding component
const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isModal = false, defaultManager }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    managerName: defaultManager?.name || '',
    email: defaultManager?.email || '',
    phone: defaultManager?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const config: PropertyConfig = {
      id: `prop-${Date.now()}`,
      name: formData.name,
      managerName: formData.managerName,
      managerEmail: formData.email,
      managerPhone: formData.phone,
      airbnbUrl: '',
      isConfigured: true
    };

    if (!isModal) await new Promise(resolve => setTimeout(resolve, 1500));
    onComplete(config);
    setLoading(false);
  };

  const isFormValid = formData.name && formData.managerName;

  return (
    <div className={`${!isModal ? 'min-h-screen bg-slate-50 flex items-center justify-center p-6' : ''}`}>
      <div className={`${!isModal ? 'max-w-xl w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100' : ''}`}>
        {!isModal && (
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
              <TreePine className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Property Setup</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Initialize your production workspace</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Home className="w-3 h-3 text-emerald-600" />
                Which property are you managing today?
              </label>
              <input 
                required
                autoFocus
                type="text" 
                placeholder="e.g. Wood Heaven Farms - Cottage A"
                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-emerald-500 font-black text-slate-900 transition-all text-xl"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-4 mt-2 italic">
                This name will be used to initialize your property dashboard and local records.
              </p>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3 text-indigo-500" />
                Verified Manager Identity
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                   <input 
                     required 
                     className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                     value={formData.managerName} 
                     onChange={e => setFormData({...formData, managerName: e.target.value})} 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                   <div className="relative">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                     <input 
                       required 
                       className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                       value={formData.phone} 
                       onChange={e => setFormData({...formData, phone: e.target.value})} 
                     />
                   </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notification Email</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                     <input 
                       required 
                       type="email"
                       className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                       value={formData.email} 
                       onChange={e => setFormData({...formData, email: e.target.value})} 
                     />
                   </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isFormValid}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all hover:bg-emerald-600"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Sparkles className="w-4 h-4 text-emerald-400" /> Initialize Workspace <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
