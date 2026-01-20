
import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';
import { 
  Plus, Trash2, MapPin, Fuel, Utensils, Calendar, PlusCircle, 
  PenLine, Car, Map, Banknote, TrendingUp, Wallet, ArrowUpRight, 
  CarFront, UserCircle, Smartphone, Calculator, Gauge, Edit2,
  CalendarDays
} from 'lucide-react';

interface Props {
  entries: DailyEntry[];
  onAdd: (entry: DailyEntry) => void;
  onUpdate: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
}

export const DailyLog: React.FC<Props> = ({ entries, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [newEntry, setNewEntry] = useState({
    date: getTodayString(),
    kmDriven: '',
    fuelSpent: '',
    foodSpent: '',
    parkingSpent: '',
    washSpent: '',
    tollsSpent: '',
    otherSpent: '',
    otherSpentName: '',
    uberEarnings: '',
    pop99Earnings: '',
    inDriveEarnings: '',
    privateEarnings: ''
  });

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const totals = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const dailyExpenses = (entry.fuelSpent || 0) + (entry.foodSpent || 0) + (entry.parkingSpent || 0) + 
                             (entry.washSpent || 0) + (entry.tollsSpent || 0) + (entry.otherSpent || 0);
      const dailyGains = (entry.uberEarnings || 0) + (entry.pop99Earnings || 0) + 
                          (entry.inDriveEarnings || 0) + (entry.privateEarnings || 0);
      return {
        gains: acc.gains + dailyGains,
        expenses: acc.expenses + dailyExpenses,
        km: acc.km + (entry.kmDriven || 0)
      };
    }, { gains: 0, expenses: 0, km: 0 });
  }, [entries]);

  const totalProfitPerKm = totals.km > 0 ? (totals.gains - totals.expenses) / totals.km : 0;

  const resetForm = () => {
    setNewEntry({ 
      date: getTodayString(),
      kmDriven: '', fuelSpent: '', foodSpent: '', 
      parkingSpent: '', washSpent: '', tollsSpent: '', 
      otherSpent: '', otherSpentName: '',
      uberEarnings: '', pop99Earnings: '', inDriveEarnings: '', privateEarnings: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (entry: DailyEntry) => {
    setNewEntry({
      date: entry.date.split('T')[0],
      kmDriven: entry.kmDriven.toString(),
      fuelSpent: entry.fuelSpent.toString(),
      foodSpent: entry.foodSpent.toString(),
      parkingSpent: entry.parkingSpent.toString(),
      washSpent: (entry.washSpent || '0').toString(),
      tollsSpent: (entry.tollsSpent || '0').toString(),
      otherSpent: entry.otherSpent.toString(),
      otherSpentName: entry.otherSpentName,
      uberEarnings: entry.uberEarnings.toString(),
      pop99Earnings: entry.pop99Earnings.toString(),
      inDriveEarnings: entry.inDriveEarnings.toString(),
      privateEarnings: entry.privateEarnings.toString(),
    });
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryDate = new Date(newEntry.date + 'T12:00:00Z').toISOString();
    const entryData = {
      date: entryDate,
      kmDriven: parseFloat(newEntry.kmDriven) || 0,
      fuelSpent: parseFloat(newEntry.fuelSpent) || 0,
      foodSpent: parseFloat(newEntry.foodSpent) || 0,
      parkingSpent: parseFloat(newEntry.parkingSpent) || 0,
      washSpent: parseFloat(newEntry.washSpent) || 0,
      tollsSpent: parseFloat(newEntry.tollsSpent) || 0,
      otherSpent: parseFloat(newEntry.otherSpent) || 0,
      otherSpentName: newEntry.otherSpentName,
      uberEarnings: parseFloat(newEntry.uberEarnings) || 0,
      pop99Earnings: parseFloat(newEntry.pop99Earnings) || 0,
      inDriveEarnings: parseFloat(newEntry.inDriveEarnings) || 0,
      privateEarnings: parseFloat(newEntry.privateEarnings) || 0,
    };

    if (editingId) {
      const existingEntry = entries.find(e => e.id === editingId);
      if (existingEntry) onUpdate({ ...existingEntry, ...entryData });
    } else {
      const entry: DailyEntry = { id: crypto.randomUUID(), ...entryData };
      onAdd(entry);
    }
    resetForm();
  };

  const inputClass = "w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-base outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block ml-1";
  const tagClass = "text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/50 uppercase";

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getUTCDate();
    const month = d.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
    const weekday = d.toLocaleString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
    return { day, month, weekday };
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-indigo-600 p-3 sm:p-4 rounded-3xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
          <p className="text-[9px] font-black uppercase opacity-70 mb-1">Ganhos</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] opacity-80 font-bold">R$</span>
            <span className="text-sm sm:text-lg font-black leading-none">{totals.gains.toFixed(0)}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Líquido</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-slate-400 font-bold">R$</span>
            <span className={`text-sm sm:text-lg font-black leading-none ${totals.gains - totals.expenses >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {(totals.gains - totals.expenses).toFixed(0)}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">Lucro/KM</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-slate-400 font-bold">R$</span>
            <span className="text-sm sm:text-lg font-black leading-none text-slate-700 dark:text-slate-200">
              {totalProfitPerKm.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {editingId ? 'Editando Registro' : 'Novo Turno'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Organize seu caixa</p>
          </div>
          <button 
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className={`p-3 rounded-2xl transition-all shadow-lg active:scale-95 ${showForm ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'}`}
          >
            {showForm ? 'Cancelar' : <Plus size={24} />}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 mb-8 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border-2 border-indigo-50 dark:border-indigo-900/20">
            <div>
               <label className={labelClass}>Data do Turno</label>
               <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                  <input type="date" required value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className={inputClass} />
               </div>
            </div>
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                  <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Quanto você ganhou?</h4>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Uber</label>
                    <div className="relative">
                      <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="0" value={newEntry.uberEarnings} onChange={e => setNewEntry({...newEntry, uberEarnings: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>99 Pop</label>
                    <div className="relative">
                      <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="0" value={newEntry.pop99Earnings} onChange={e => setNewEntry({...newEntry, pop99Earnings: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>inDrive</label>
                    <div className="relative">
                      <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="0" value={newEntry.inDriveEarnings} onChange={e => setNewEntry({...newEntry, inDriveEarnings: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Particular</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="0" value={newEntry.privateEarnings} onChange={e => setNewEntry({...newEntry, privateEarnings: e.target.value})} className={inputClass} />
                    </div>
                  </div>
               </div>
            </div>
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                  <h4 className="text-[10px] font-black uppercase text-rose-600 tracking-widest">O que você gastou?</h4>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>KM Rodados</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                      <input type="number" step="any" required placeholder="0 KM" value={newEntry.kmDriven} onChange={e => setNewEntry({...newEntry, kmDriven: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Combustível</label>
                    <div className="relative">
                      <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="R$ 0" value={newEntry.fuelSpent} onChange={e => setNewEntry({...newEntry, fuelSpent: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Alimentação</label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="R$ 0" value={newEntry.foodSpent} onChange={e => setNewEntry({...newEntry, foodSpent: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Estac./Pedágio</label>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="R$ 0" value={newEntry.parkingSpent} onChange={e => setNewEntry({...newEntry, parkingSpent: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Limpeza/Outros</label>
                    <div className="relative">
                      <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="number" step="any" placeholder="R$ 0" value={newEntry.otherSpent} onChange={e => setNewEntry({...newEntry, otherSpent: e.target.value})} className={inputClass} />
                    </div>
                  </div>
               </div>
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">
              {editingId ? 'Atualizar Registro' : 'Finalizar Turno'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-500" />
            Histórico de Turnos
          </h3>
          
          {sortedEntries.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
               <p className="text-xs text-slate-400 font-medium italic">Seus turnos aparecerão aqui.<br/>Registre seu primeiro dia.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {sortedEntries.map(entry => {
                const totalDailyExpenses = (entry.fuelSpent || 0) + (entry.foodSpent || 0) + (entry.parkingSpent || 0) + (entry.washSpent || 0) + (entry.tollsSpent || 0) + (entry.otherSpent || 0);
                const totalDailyGains = (entry.uberEarnings || 0) + (entry.pop99Earnings || 0) + (entry.inDriveEarnings || 0) + (entry.privateEarnings || 0);
                const dailyProfit = totalDailyGains - totalDailyExpenses;
                const dailyProfitPerKm = entry.kmDriven > 0 ? dailyProfit / entry.kmDriven : 0;
                const { day, month, weekday } = formatDisplayDate(entry.date);
                
                return (
                  <div key={entry.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col gap-4 group transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm text-center min-w-[55px]">
                          <span className="block text-[7px] font-black text-indigo-500 uppercase leading-none mb-1">{weekday}</span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">{day}</span>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase mt-0.5">{month}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">Turno Finalizado</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                             <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                               <MapPin size={10} /> {entry.kmDriven} KM
                             </span>
                             <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                               <Gauge size={10} /> R$ {dailyProfitPerKm.toFixed(2)}/KM
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(entry)} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => onDelete(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black uppercase text-emerald-500 block mb-1">Ganhos</span>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">R$ {totalDailyGains.toFixed(2)}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {entry.uberEarnings > 0 && <span className={tagClass}>Uber</span>}
                             {entry.pop99Earnings > 0 && <span className={tagClass}>99</span>}
                             {entry.inDriveEarnings > 0 && <span className={tagClass}>inDr.</span>}
                             {entry.privateEarnings > 0 && <span className={tagClass}>Part.</span>}
                          </div>
                       </div>
                       <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black uppercase text-rose-500 block mb-1">Gastos</span>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">R$ {totalDailyExpenses.toFixed(2)}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {entry.fuelSpent > 0 && <span className={tagClass}>Comb.</span>}
                             {entry.foodSpent > 0 && <span className={tagClass}>Alim.</span>}
                             {(entry.parkingSpent > 0 || entry.tollsSpent > 0) && <span className={tagClass}>Taxas</span>}
                             {entry.otherSpent > 0 && <span className={tagClass}>Outro</span>}
                          </div>
                       </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl flex justify-between items-center ${dailyProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30'}`}>
                       <div>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${dailyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Saldo Líquido</span>
                          <p className={`text-lg font-black leading-none ${dailyProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                             R$ {dailyProfit.toFixed(2)}
                          </p>
                       </div>
                       <div className={`p-2 rounded-xl ${dailyProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600'}`}>
                          {dailyProfit >= 0 ? <TrendingUp size={20} /> : <Calculator size={20} />}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
