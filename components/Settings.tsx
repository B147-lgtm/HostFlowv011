
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  FileDown, 
  CheckCircle2, 
  Database,
  CloudLightning,
  Smartphone,
  Laptop,
  ArrowRight
} from 'lucide-react';

interface SettingsProps {
  allData: any;
  onImportSync: (data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ allData, onImportSync }) => {
  const [successMsg, setSuccessMsg] = useState('');

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `hostflow_exclusive_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setSuccessMsg('Desktop Backup Downloaded!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight uppercase">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            Portal Settings
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">System Health • Secure Architecture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Oversight */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Database className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black uppercase tracking-tight">Cloud Vault Identity</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Direct Production Access</p></div>
           </div>

           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Identity</p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-black">B</div>
                 <p className="text-lg font-black text-slate-900 truncate">badal.london@gmail.com</p>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <CloudLightning className="w-4 h-4 text-emerald-500" />
                How to access on other devices?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-6">
                    <div className="flex gap-2 shrink-0">
                      <Smartphone className="w-5 h-5 text-indigo-400" />
                      <Laptop className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-indigo-900">Simply visit the HostFlow URL and log in with your exclusive credentials. All property data is synced in real-time.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Data Management */}
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl space-y-8">
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400"><Download className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black uppercase tracking-tight">Hard Backups</h2><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Physical file archiving</p></div>
           </div>

           <div className="space-y-4">
              <button 
                onClick={handleDownloadBackup}
                className="w-full py-6 bg-white/5 border-2 border-dashed border-white/20 text-white hover:border-emerald-500 hover:text-emerald-500 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
              >
                <FileDown className="w-5 h-5" /> Download Exclusive JSON Backup
              </button>
              <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest leading-relaxed px-6">We recommend downloading a physical backup once a week for absolute data redundancy.</p>
           </div>

           {successMsg && (
             <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-3 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                {successMsg}
             </div>
           )}

           <div className="pt-8 border-t border-white/5 space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">System Version</h3>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Production v33</span>
                 <ArrowRight className="w-4 h-4 text-slate-700" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
