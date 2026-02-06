
import React, { useState } from 'react';
import { InventoryCategory, InventoryItem, StockStatus, Booking } from '../types';
import { 
  Plus, 
  Minus,
  Search, 
  CirclePlus, 
  Trash2, 
  RotateCcw,
  Filter,
  Package,
  TriangleAlert,
  X,
  Save,
  CircleCheck,
  Edit,
  Settings
} from 'lucide-react';
import { MOCK_INVENTORY } from '../constants';

interface InventoryProps {
  propertyName: string;
  bookings: Booking[];
  inventoryItems: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  activePropertyId?: string;
}

const Inventory: React.FC<InventoryProps> = ({ propertyName, inventoryItems, onUpdateInventory, activePropertyId }) => {
  const [filter, setFilter] = useState<InventoryCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: InventoryCategory.USABLES,
    quantity: '',
    unit: 'Units',
    minThreshold: '5'
  });

  const getStatus = (item: InventoryItem): StockStatus => {
    if (item.quantity === 0) return StockStatus.OUT_OF_STOCK;
    if (item.quantity <= item.minThreshold) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  };

  const handleUpdate = (id: string, field: keyof InventoryItem, value: any) => {
    const updated = inventoryItems.map(item => 
      item.id === id ? { ...item, [field]: value, lastUpdated: new Date().toISOString().split('T')[0] } : item
    );
    onUpdateInventory(updated);
  };

  const adjustQuantity = (id: string, delta: number) => {
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      handleUpdate(id, 'quantity', newQty);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Remove this article from the ledger permanently?")) {
      onUpdateInventory(inventoryItems.filter(i => i.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("Restore master list from PDF records? This will overwrite local changes.")) {
      const targetId = activePropertyId && activePropertyId !== 'all' ? activePropertyId : 'prop-1';
      onUpdateInventory(MOCK_INVENTORY.map(item => ({ ...item, propertyId: targetId })));
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      id: `art-${Date.now()}`,
      propertyId: activePropertyId && activePropertyId !== 'all' ? activePropertyId : 'prop-1',
      name: newItem.name.toUpperCase(),
      category: newItem.category,
      quantity: Number(newItem.quantity),
      unit: newItem.unit,
      minThreshold: Number(newItem.minThreshold),
      lastUpdated: new Date().toISOString().split('T')[0],
      unitCost: 0
    };
    onUpdateInventory([...inventoryItems, item]);
    setIsAddModalOpen(false);
    setNewItem({ name: '', category: InventoryCategory.USABLES, quantity: '', unit: 'Units', minThreshold: '5' });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = inventoryItems.map(item => 
      item.id === editingItem.id ? { ...editingItem, name: editingItem.name.toUpperCase() } : item
    );
    onUpdateInventory(updated);
    setEditingItem(null);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-inter max-w-7xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Package className="w-7 h-7" />
            </div>
            Inventory Sheet
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 ml-1">
            {propertyName} • {inventoryItems.length} Registered Articles
          </p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-5 py-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Restore Master
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 hover:bg-emerald-600 transition-all"
          >
            <CirclePlus className="w-4 h-4" />
            Add New Article
          </button>
        </div>
      </div>

      {/* Clean Filtering */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search by article name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
          />
        </div>
        <div className="lg:col-span-2 flex gap-1 bg-slate-50 p-1.5 rounded-2xl">
          {['All', ...Object.values(InventoryCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6 text-left">Article & Measurement</th>
                <th className="px-10 py-6 text-center">Daily Stock Adjustment</th>
                <th className="px-10 py-6 text-center">Threshold</th>
                <th className="px-10 py-6 text-center">Health</th>
                <th className="px-10 py-6 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Search className="w-12 h-12 text-slate-200" />
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No Articles Found</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${
                            status === StockStatus.OUT_OF_STOCK ? 'bg-rose-50 border-rose-100 text-rose-500' :
                            status === StockStatus.LOW_STOCK ? 'bg-amber-50 border-amber-100 text-amber-500' :
                            'bg-slate-50 border-slate-100 text-slate-400'
                          }`}>
                            {item.quantity}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight uppercase leading-none mb-2">{item.name}</p>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{item.unit}</span>
                               <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">• {item.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => adjustQuantity(item.id, -1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdate(item.id, 'quantity', Number(e.target.value))}
                            className={`w-24 text-center py-3 font-black text-xl border-2 rounded-xl bg-white outline-none transition-all shadow-sm ${
                              status === StockStatus.OUT_OF_STOCK ? 'text-rose-600 border-rose-200' :
                              status === StockStatus.LOW_STOCK ? 'text-amber-500 border-amber-200' :
                              'text-slate-900 border-slate-200 focus:border-emerald-500'
                            }`}
                          />

                          <button 
                            onClick={() => adjustQuantity(item.id, 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="inline-flex flex-col items-center">
                          <input 
                            type="number"
                            value={item.minThreshold}
                            onChange={(e) => handleUpdate(item.id, 'minThreshold', Number(e.target.value))}
                            className="w-16 text-center py-1.5 bg-slate-50 border-none rounded-xl font-bold text-xs text-slate-500 outline-none focus:ring-1 focus:ring-slate-200"
                          />
                          <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest">Alert At</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] border-2 transition-all ${
                          status === StockStatus.IN_STOCK ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          status === StockStatus.LOW_STOCK ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {status === StockStatus.IN_STOCK ? <CircleCheck className="w-3.5 h-3.5" /> : <TriangleAlert className="w-3.5 h-3.5" />}
                          {status}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingItem(item)}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Article & Unit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Remove from List"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Article Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Identity</h2>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Modify Article & Measurement</p>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Article Full Name</label>
                  <input 
                    required autoFocus
                    type="text" 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold uppercase text-sm placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="E.G. SILVER TEAPOTS"
                    value={editingItem.name}
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                    <select 
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-xs uppercase outline-none"
                      value={editingItem.category}
                      onChange={e => setEditingItem({...editingItem, category: e.target.value as InventoryCategory})}
                    >
                      {Object.values(InventoryCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Measurement Unit</label>
                    <input 
                      required type="text"
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm uppercase outline-none"
                      placeholder="Units/Kg/Liters"
                      value={editingItem.unit}
                      onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black uppercase tracking-widest text-xs"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-2 w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-slate-900 transition-all"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Article Registration</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <form onSubmit={handleAddNewItem} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Article Name</label>
                  <input 
                    required autoFocus
                    type="text" 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold uppercase text-sm placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="E.G. SILVER DINNER PLATES"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                    <select 
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-xs uppercase outline-none"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value as InventoryCategory})}
                    >
                      {Object.values(InventoryCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Unit</label>
                    <input 
                      required type="text"
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm uppercase"
                      placeholder="e.g. Units"
                      value={newItem.unit}
                      onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Initial Count</label>
                    <input 
                      required type="number"
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-black text-2xl text-emerald-600 outline-none"
                      value={newItem.quantity}
                      onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Min. Safe Level</label>
                    <input 
                      required type="number"
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-black text-2xl text-rose-500 outline-none"
                      value={newItem.minThreshold}
                      onChange={e => setNewItem({...newItem, minThreshold: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 hover:bg-emerald-600"
              >
                <Save className="w-5 h-5" />
                Register to Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
