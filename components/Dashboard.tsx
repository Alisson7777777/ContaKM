
import React, { useState } from 'react';
import { CalculationResults, DriverCosts } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Info, AlertCircle, CheckCircle2, TrendingUp, DollarSign, Wallet, ArrowRight, Zap, ChevronDown, ChevronUp, PieChart as PieIcon, Save, RefreshCw, Clock, Target, CreditCard } from 'lucide-react';

interface Props {
  results: CalculationResults;
  costs: DriverCosts;
  onSave?: () => void;
  onSync?: () => void;
}

export const Dashboard: React.FC<Props> = ({ results, costs, onSave, onSync }) => {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  const getProfitAnalysis = () => {
    const km = results.costPerKm;
    if (km < 0.75) return { text: "Altíssima Eficiência", color: "text-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: CheckCircle2 };
    if (km < 1.15) return { text: "Operação Saudável", color: "text-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: Info };
    if (km < 1.50) return { text: "Custo Elevado", color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: AlertCircle };
    return { text: "Operação Crítica", color: "text-rose-500", border: "border-rose-500/30", bg: "bg-rose-500/10", icon: AlertCircle };
  };

  const analysis = getProfitAnalysis();
  const StatusIcon = analysis.icon;
  const entriesCount = (costs.dailyEntries || []).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 block">Custo por KM Rodado</span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">R$</span>
                <span className={`text-7xl md:text-8xl font-black ${analysis.color} tracking-tighter tabular-nums`}>{results.costPerKm.toFixed(2)}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${analysis.bg} ${analysis.border} ${analysis.color} font-black text-[10px] uppercase tracking-widest shadow-sm`}>
              <StatusIcon size={14} />
              {analysis.text}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative min-w-[280px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                <Target size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-100/70 mb-3">Tarifa Mínima Sugerida</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold opacity-70">R$</span>
                <span className="text-5xl font-black tabular-nums">{results.suggestedMinFarePerKm.toFixed(2)}</span>
                <span className="text-sm font-bold opacity-70">/km</span>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-indigo-200">Meta Hora</span>
                  <span className="text-sm font-black">R$ {results.suggestedMinFarePerHour.toFixed(0)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-indigo-200">Margem KM</span>
                  <span className="text-sm font-black">R$ {costs.targetProfitPerKm.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl w-fit text-emerald-500"><CreditCard size={18} /></div>
          <p className="text-[9px] font-black uppercase text-slate-400">Ponto de Equilíbrio</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">R$ {results.breakEvenDaily.toFixed(0)}/dia</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 bg-blue-500/10 rounded-xl w-fit text-blue-500"><Clock size={18} /></div>
          <p className="text-[9px] font-black uppercase text-slate-400">Custo por Hora</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">R$ {results.costPerHour.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 bg-amber-500/10 rounded-xl w-fit text-amber-500"><TrendingUp size={18} /></div>
          <p className="text-[9px] font-black uppercase text-slate-400">Lucro Mensal</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">R$ {(costs.monthlyMileage * costs.targetProfitPerKm).toFixed(0)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl w-fit text-indigo-500"><PieIcon size={18} /></div>
          <p className="text-[9px] font-black uppercase text-slate-400">Total Despesas</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">R$ {results.totalMonthlyCost.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <PieIcon size={14} className="text-indigo-500" />
            Impacto no Bolso
          </h4>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={results.breakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="monthly">
                  {results.breakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Zap size={140} /></div>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500 rounded-xl"><Target size={20} /></div>
               <h3 className="font-black text-lg italic">Metas Reais</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                 <span className="text-[10px] font-black uppercase text-indigo-300">Meta Diária (Bruto)</span>
                 <span className="text-lg font-black italic">R$ {(results.breakEvenDaily + (costs.monthlyMileage * costs.targetProfitPerKm / (costs.workDaysPerWeek * 4.33))).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                 <span className="text-[10px] font-black uppercase text-indigo-300">Custo KM + Meta Lucro</span>
                 <span className="text-lg font-black italic">R$ {results.suggestedMinFarePerKm.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                Esses valores representam o faturamento necessário para cobrir todos os seus custos (inclusive invisíveis) e ainda sobrar o seu lucro desejado.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={onSave} className="flex-1 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/50">
                <Save size={16} /> Salvar Mês
              </button>
              <button onClick={onSync} className="py-4 px-5 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
