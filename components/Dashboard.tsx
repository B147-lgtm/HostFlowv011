
import React, { useMemo, useState } from 'react';
import { 
  DollarSign, TrendingUp, ArrowUpRight, Layers, Home, ChevronLeft, ChevronRight, Calendar, Users, Percent
} from 'lucide-react';
import { TransactionType, Booking, Transaction, Guest, BookingStatus, PropertyConfig, StaffLog } from '../types';

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{title}</h3>
    <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{subtitle}</p>}
  </div>
);

const OccupancyCalendar = ({ bookings }: { bookings: Booking[] }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, fullDate: null });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isOccupied = bookings.some(b => {
        if (!b.checkIn || !b.checkOut || b.status === BookingStatus.CANCELLED) return false;
        const start = b.checkIn.split('T')[0];
        const end = b.checkOut.split('T')[0];
        return fullDate >= start && fullDate < end;
      });
      days.push({ day: i, fullDate, isOccupied });
    }
    return days;
  }, [viewDate, bookings]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Occupancy Calendar</h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Live Inventory Availability</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest min-w-[140px] text-center">{monthName} {viewDate.getFullYear()}</span>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[2px] pb-4">{d}</div>
        ))}
        {calendarData.map((d, idx) => (
          <div 
            key={idx} 
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative group transition-all border-2 ${
              d.day 
                ? (d.isOccupied 
                    ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-100 text-white' 
                    : 'bg-white border-slate-50 hover:border-emerald-200 text-slate-900') 
                : 'bg-transparent border-transparent'
            }`}
          >
            {d.day && <span className="text-xs font-black">{d.day}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DashboardProps {
  bookings: Booking[];
  transactions: Transaction[];
  guests: Guest[];
  staffLogs: StaffLog[];
  property: PropertyConfig;
  isGlobal?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, transactions, guests, staffLogs, property, isGlobal }) => {
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. Revenue (Current Month)
    const monthIncome = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === TransactionType.INCOME && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === TransactionType.EXPENSE && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Confirmed Guests (Current Month check-ins)
    const confirmedGuestsCount = bookings.filter(b => {
      const d = new Date(b.checkIn);
      return b.status !== BookingStatus.CANCELLED && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // 3. Operating Margin (%)
    // Formula: ((Revenue - Expenses) / Revenue) * 100
    const operatingMargin = monthIncome > 0 
      ? ((monthIncome - monthExpense) / monthIncome) * 100 
      : 0;

    // 4. Occupancy (%)
    // Check how many days of the current month are occupied
    let occupiedDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isOccupied = bookings.some(b => {
        if (b.status === BookingStatus.CANCELLED) return false;
        const start = b.checkIn.split('T')[0];
        const end = b.checkOut.split('T')[0];
        return dateStr >= start && dateStr < end;
      });
      if (isOccupied) occupiedDays++;
    }
    const occupancyRate = (occupiedDays / daysInMonth) * 100;

    return {
      revenue: monthIncome,
      confirmedGuests: confirmedGuestsCount,
      margin: operatingMargin.toFixed(1),
      occupancy: occupancyRate.toFixed(1),
      monthName: now.toLocaleString('default', { month: 'long' })
    };
  }, [transactions, bookings]);

  const displayPropertyName = property?.name || "Portfolio Overview";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            {isGlobal ? <Layers className="w-8 h-8 text-indigo-600" /> : <Home className="w-8 h-8 text-emerald-600" />}
            {displayPropertyName}
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-[2px]">
            {currentMonthStats.monthName} {new Date().getFullYear()} Performance Snapshot
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue" 
          value={`₹${currentMonthStats.revenue.toLocaleString('en-IN')}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
          subtitle="Total Income This Month"
        />
        <StatCard 
          title="Confirmed Guests" 
          value={currentMonthStats.confirmedGuests} 
          icon={Users} 
          color="bg-blue-500" 
          subtitle="Check-ins This Month"
        />
        <StatCard 
          title="Operating Margin" 
          value={`${currentMonthStats.margin}%`} 
          icon={Percent} 
          color="bg-indigo-500" 
          subtitle="Profit/Revenue Ratio"
        />
        <StatCard 
          title="Occupancy" 
          value={`${currentMonthStats.occupancy}%`} 
          icon={TrendingUp} 
          color="bg-amber-500" 
          subtitle="Days Booked This Month"
        />
      </div>

      <OccupancyCalendar bookings={bookings} />
    </div>
  );
};

export default Dashboard;
