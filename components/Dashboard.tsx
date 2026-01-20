
import React, { useState } from 'react';
import { CalculationResults, DriverCosts } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Info, AlertCircle, CheckCircle2, TrendingUp, DollarSign, Wallet, ArrowRight, Zap, ChevronDown, ChevronUp, PieChart as PieIcon, Save, RefreshCw } from 'lucide-react';

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
    if (km < 0.70) return { text: "Operação Muito Eficiente", color: "text-emerald-600", border: "border-emerald-200 dark:border-emerald-800/50", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle2 };
    if (km < 1.10) return { text: "Custo Dentro da Média", color: "text-blue-600", border: "border-blue-200 dark:border-blue-800/50", bg: "bg-blue-50 dark:bg-blue-950/20", icon: Info };
    if (km < 1.45) return { text: "Atenção: Custo Elevado", color: "text-amber-600", border: "border-amber-200 dark:border-amber-800/50", bg: "bg-amber-50 dark:bg-amber-950/20", icon: AlertCircle };
    return { text: "Crítico: Operação em Risco", color: "text-rose-600", border: "border-rose-200 dark:border-rose-800/50", bg: "bg-rose-50 dark:bg-rose-950/20", icon: AlertCircle };
  };

  const analysis = getProfitAnalysis();
  const StatusIcon = analysis.icon;

  const entriesCount = (costs.dailyEntries || []).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 block">Quanto custa rodar 1 km</span>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-xl font-bold text-slate-400">R$</span>
              <span className={`text-6xl md:text-7xl font-black ${analysis.color} tracking-tighter`}>{results.costPerKm.toFixed(2)}</span>
            </div>
            <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 ${analysis.bg} ${analysis.border} ${analysis.color} font-bold text-xs shadow-sm`}>
              <StatusIcon size={16} />
              {analysis.text}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none text-center relative flex flex-col items-center justify-center min-h-[160px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
              <Zap size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-2">Tarifa Mínima Sugerida</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg font-bold opacity-80">R$</span>
              <span className="text-4xl font-black">{results.suggestedMinFarePerKm.toFixed(2)}</span>
              <span className="text-sm font-bold opacity-80">/km</span>
            </div>
            <p className="text-[10px] mt-3 text-indigo-100/70 font-medium">Aceite corridas acima deste valor para ter lucro real.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <PieIcon size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Composição</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ver Detalhes</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onSync}
          disabled={entriesCount === 0}
          className={`p-4 rounded-[1.5rem] border shadow-sm flex items-center justify-between group transition-all active:scale-[0.98] ${entriesCount > 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50 cursor-not-allowed'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`${entriesCount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-200 dark:bg-slate-700'} p-2 rounded-xl`}>
              <RefreshCw size={20} className={entriesCount > 0 ? 'animate-pulse' : ''} />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-tight">Importar Real</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest">{entriesCount} turnos</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onSave}
          className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-[1.5rem] border border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-between group transition-all active:scale-[0.98] text-white"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-white">
              <Save size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-tight">Encerrar</h3>
              <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest">Histórico</p>
            </div>
          </div>
        </button>
      </div>

      {showDetailedBreakdown && (
        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <DollarSign size={14} className="text-indigo-500" />
               Detalhamento do Custo
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {results.breakdown.map((cat, i) => (
              <div key={i} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase truncate ml-2">{cat.name}</span>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">R$ {cat.perKm.toFixed(2)}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{cat.percentage.toFixed(0)}% do total</p>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Margem Lucro</span>
              <div>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 leading-none">R$ {costs.targetProfitPerKm.toFixed(2)}</p>
                <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase">Sobra no bolso</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Peso das Despesas</h4>
            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
               <span className="text-[9px] font-bold text-slate-500">Mês</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={results.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="monthly"
                >
                  {results.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Mensal']}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/50 space-y-5">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white dark:bg-amber-900/40 rounded-xl shadow-sm">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
             </div>
             <div>
               <h4 className="text-amber-900 dark:text-amber-200 font-extrabold text-sm uppercase tracking-tight">Cuidado com o prejuízo</h4>
               <p className="text-[10px] text-amber-700 dark:text-amber-400/80 font-medium">Análise de Riscos</p>
             </div>
           </div>

           <div className="space-y-3">
              <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-2xl text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Impacto de Combustível
                </p>
                <p className="text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  Se o preço subir R$ 0,50, seu custo por KM sobe para <strong className="text-amber-950 dark:text-amber-100">R$ {(results.costPerKm + (0.50 / (costs.isGnvEnabled ? (costs.gnvConsumption || 1) : (costs.consumption || 1)))).toFixed(2)}</strong>.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-2xl text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Custo Estratégico</p>
                <p className="text-amber-800 dark:text-amber-400/90 leading-relaxed">Seu carro custa <strong className="text-amber-950 dark:text-amber-100">R$ {(results.totalMonthlyCost / 30).toFixed(2)}</strong> por dia parado. Rodar é preciso!</p>
              </div>
           </div>

           <button className="w-full py-3.5 bg-amber-600 dark:bg-amber-700 text-white rounded-[1.2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 dark:shadow-none active:scale-95">
             Estratégias de Lucro
             <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};
