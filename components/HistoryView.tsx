
import React from 'react';
import { HistoryRecord } from '../types';
import { History, Trash2, Calendar, MapPin, Wallet, Zap, Fuel } from 'lucide-react';

interface Props {
  history: HistoryRecord[];
  onDelete: (id: string) => void;
}

export const HistoryView: React.FC<Props> = ({ history, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
          <History size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-2">Sem histórico ainda</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Ao final de cada mês, salve seus resultados para acompanhar sua evolução financeira aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <History className="text-indigo-600" />
          Histórico Mensal
        </h2>
        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {history.length} {history.length === 1 ? 'Registro' : 'Registros'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((record) => (
          <div key={record.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl text-slate-600 dark:text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">{record.month}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {record.isGnv ? (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                        <Zap size={10} className="fill-emerald-600" /> GNV Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 dark:text-blue-400">
                        <Fuel size={10} className="fill-blue-600" /> Gaso/Etanol
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDelete(record.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Custo KM</span>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">R$ {record.costPerKm.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Mês</span>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">R$ {record.totalMonthlyCost.toFixed(0)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">KM Rodado</span>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{record.monthlyMileage.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-600 p-4 rounded-2xl text-white">
                <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest block mb-1">Tarifa Sug.</span>
                <p className="text-xl font-black leading-none">R$ {record.suggestedMinFarePerKm.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
