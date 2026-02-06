
import React, { useState } from 'react';
import { 
  Loader2, 
  Lock, 
  Mail, 
  AlertCircle,
  Leaf,
  ArrowRight,
  ShieldCheck,
  User,
  CheckCircle2
} from 'lucide-react';
import { cloudSync } from '../services/cloudService';

interface AuthProps {
  onLogin: (email: string, password: string, remoteData: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign In Flow
        const data = await cloudSync.login(email, password);
        if (data) {
          onLogin(email, password, data);
        } else {
          setError("Login unsuccessful. Please verify your credentials.");
          setIsLoading(false);
        }
      } else {
        // Registration Flow
        // We use a default initial state for new users
        const initialState = {
          properties: [],
          activePropertyId: 'all',
          allBookings: [],
          allTransactions: [],
          allGuests: [],
          allStaffLogs: [],
          allInventory: [],
          stayPackages: [
            { id: 'p1', title: 'Basic Stay', desc: 'Standard room access.', iconType: 'home' },
            { id: 'p2', title: 'Premium Suite', desc: 'Luxury quarters upgrade.', iconType: 'star' },
            { id: 'p3', title: 'Event Hall', desc: 'Access to gardens and main hall.', iconType: 'sparkles' }
          ],
          timestamp: Date.now(),
          userName: name
        };

        const success = await cloudSync.createAccount(email, password, initialState);
        if (success) {
          setSuccess("Account created successfully! Attempting to sign you in...");
          // Attempt immediate login after signup
          const data = await cloudSync.login(email, password);
          if (data) {
            setTimeout(() => onLogin(email, password, data), 1500);
          } else {
            setSuccess("Account created! Please sign in with your new credentials.");
            setIsLogin(true);
            setIsLoading(false);
          }
        } else {
          setError("Registration failed. Email might already be in use or password too weak.");
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError("A connection error occurred. Please check your Supabase configuration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-6 font-inter text-slate-900 selection:bg-emerald-100">
      <div className="max-w-md w-full animate-in fade-in duration-1000">
        {/* Brand Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center gap-3">
             <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-emerald-400 shadow-2xl">
               <Leaf className="w-7 h-7" />
             </div>
             <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase">HostFlow</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] ml-1">Hospitality</p>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.1em] italic">Bespoke Management Suite</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05),0_0_1px_rgba(0,0,0,0.1)] p-10 md:p-14 border border-slate-100">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
               {isLogin ? 'Welcome Back' : 'Create Account'}
             </h2>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">
               {isLogin ? 'Access your private vault' : 'Initialize your production workspace'}
             </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group animate-in slide-in-from-top-4">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 font-bold transition-all text-sm placeholder:text-slate-300" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                required 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 font-bold transition-all text-sm placeholder:text-slate-300" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                required 
                type="password" 
                placeholder="Password" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 font-bold transition-all text-sm placeholder:text-slate-300" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-6 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-8"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isLogin ? 'Sign In to Dashboard' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center pt-8 border-t border-slate-50">
            <div className="flex items-center gap-2 text-[9px] text-slate-300 font-black uppercase tracking-widest opacity-60">
              <ShieldCheck className="w-3.5 h-3.5" /> 
              Secure Encrypted Portal
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
            HostFlow &copy; 2025 • Bespoke Hospitality Suite
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
