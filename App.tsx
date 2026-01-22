
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { CalculatorForm } from './components/CalculatorForm';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { HistoryView } from './components/HistoryView';
import { DailyLog } from './components/DailyLog';
import { Auth } from './components/Auth';
import { DriverCosts, CalculationResults, CategoryBreakdown, HistoryRecord, DailyEntry } from './types';
import { Calculator, LayoutDashboard, Moon, Sun, History, CalendarDays, LogOut, Loader2, CloudCheck, CloudUpload, CheckCircle2 } from 'lucide-react';

const THEME_KEY = 'motorista_lucrativo_theme';

const INITIAL_COSTS: DriverCosts = {
  fuelPrice: 5.89,
  consumption: 10,
  isGnvEnabled: false,
  gnvPrice: 4.49,
  gnvConsumption: 13,
  monthlyMileage: 3000,
  workHoursPerDay: 10,
  workDaysPerWeek: 6,
  maintenance: 0,
  maintenanceItems: [],
  insurance: 180,
  annualIpva: 1200,
  annualLicensing: 150,
  loanPayment: 0,
  isRented: false,
  rentalCost: 2400,
  foodExpenses: 400,
  depreciation: 400,
  cleaning: 120,
  dataPlan: 50,
  appFees: 0,
  others: 0,
  othersName: '',
  othersItems: [],
  targetProfitPerKm: 1.00,
  dailyEntries: [],
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const isDataLoaded = useRef(false);

  const [costs, setCosts] = useState<DriverCosts>(INITIAL_COSTS);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [activeTab, setActiveTab] = useState<'calc' | 'dashboard' | 'daily' | 'history' | 'ai'>('daily');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      if (session) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') fetchUserData(session.user.id);
      } else {
        setCosts(INITIAL_COSTS);
        setHistory([]);
        setLoading(false);
        isDataLoaded.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    isDataLoaded.current = false;
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('costs, history, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Merge DB costs with INITIAL_COSTS to ensure new fields are populated for old users
        if (data.costs) {
          setCosts({ ...INITIAL_COSTS, ...data.costs });
        }
        if (data.history) setHistory(data.history);
        setLastSaved(new Date(data.updated_at));
      }
      isDataLoaded.current = true;
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || !isDataLoaded.current || loading || isRecovering) return;
    const saveTimeout = setTimeout(async () => {
      setSyncing(true);
      try {
        const { error } = await supabase
          .from('user_data')
          .upsert({ 
            user_id: session.user.id, 
            costs, 
            history,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
        setLastSaved(new Date());
      } catch (err: any) {
        console.error('Falha na persistência:', err.message);
      } finally {
        setSyncing(false);
      }
    }, 2000);
    return () => clearTimeout(saveTimeout);
  }, [costs, history, session, loading, isRecovering]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const results: CalculationResults = useMemo(() => {
    const km = Math.max(costs.monthlyMileage, 1);
    const workHoursMonthly = (costs.workHoursPerDay || 0) * (costs.workDaysPerWeek || 0) * 4.33; // Média de semanas no mês
    const totalDaysWorked = (costs.workDaysPerWeek || 0) * 4.33;

    const fuelCostPerKm = costs.isGnvEnabled ? (costs.gnvConsumption > 0 ? costs.gnvPrice / costs.gnvConsumption : 0) : (costs.consumption > 0 ? costs.fuelPrice / costs.consumption : 0);
    const fuelCostMonthly = km * fuelCostPerKm;
    
    const monthlyTaxes = costs.isRented ? 0 : (costs.annualIpva + costs.annualLicensing) / 12;
    const insurance = costs.isRented ? 0 : costs.insurance;
    const depreciation = costs.isRented ? 0 : costs.depreciation;
    const loanOrRental = costs.isRented ? costs.rentalCost : costs.loanPayment;

    const totalMonthlyCost = fuelCostMonthly + insurance + monthlyTaxes + costs.maintenance + depreciation + costs.foodExpenses + costs.cleaning + costs.dataPlan + costs.others + loanOrRental;
    
    const costPerKm = totalMonthlyCost / km;
    const costPerHour = workHoursMonthly > 0 ? totalMonthlyCost / workHoursMonthly : 0;
    const breakEvenDaily = totalDaysWorked > 0 ? totalMonthlyCost / totalDaysWorked : 0;

    const breakdown: CategoryBreakdown[] = [
      { name: 'Combustível', monthly: fuelCostMonthly, perKm: fuelCostPerKm, percentage: (fuelCostMonthly / totalMonthlyCost) * 100, color: '#6366f1' },
      { name: 'Manutenção', monthly: costs.maintenance, perKm: costs.maintenance / km, percentage: (costs.maintenance / totalMonthlyCost) * 100, color: '#f59e0b' },
      { name: 'Fixos (IPVA/Seg)', monthly: monthlyTaxes + insurance, perKm: (monthlyTaxes + insurance) / km, percentage: ((monthlyTaxes + insurance) / totalMonthlyCost) * 100, color: '#10b981' },
      { name: 'Carro (Parc/Alug)', monthly: loanOrRental, perKm: loanOrRental / km, percentage: (loanOrRental / totalMonthlyCost) * 100, color: '#ec4899' },
      { name: 'Outros/Deprec.', monthly: costs.foodExpenses + costs.cleaning + costs.others + depreciation, perKm: (costs.foodExpenses + costs.cleaning + costs.others + depreciation) / km, percentage: ((costs.foodExpenses + costs.cleaning + costs.others + depreciation) / totalMonthlyCost) * 100, color: '#64748b' }
    ];

    return {
      fuelCostMonthly,
      fuelCostPerKm,
      totalMonthlyCost,
      costPerKm,
      costPerHour,
      suggestedMinFarePerKm: costPerKm + costs.targetProfitPerKm,
      suggestedMinFarePerHour: workHoursMonthly > 0 ? (totalMonthlyCost + (km * costs.targetProfitPerKm)) / workHoursMonthly : 0,
      breakEvenDaily,
      profitMarginPercentage: costs.targetProfitPerKm > 0 ? (costs.targetProfitPerKm / (costPerKm + costs.targetProfitPerKm)) * 100 : 0,
      breakdown
    };
  }, [costs]);

  const handleSaveHistory = () => {
    const now = new Date();
    const monthYear = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    const newRecord: HistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      month: monthYear.charAt(0).toUpperCase() + monthYear.slice(1),
      costPerKm: results.costPerKm,
      totalMonthlyCost: results.totalMonthlyCost,
      monthlyMileage: costs.monthlyMileage,
      suggestedMinFarePerKm: results.suggestedMinFarePerKm,
      isGnv: costs.isGnvEnabled,
      isRented: costs.isRented
    };

    setHistory(prev => [newRecord, ...prev]);
    setActiveTab('history');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  if (isRecovering) return <Auth onLogin={(user) => { setSession({ user }); setIsRecovering(false); }} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protegendo Dados...</span></div>;
  if (!session) return <Auth onLogin={(user) => setSession({ user })} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20 lg:pb-0">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg text-white"><Calculator className="w-5 h-5" /></div>
            <div className="hidden xs:block">
              <h1 className="text-sm font-black text-slate-800 dark:text-slate-100 italic">ContaKM</h1>
              <div className="mt-0.5 h-3 flex items-center">
                {syncing ? <span className="flex items-center gap-1 text-[7px] font-black text-indigo-500 uppercase tracking-tighter"><CloudUpload size={8} /> Sincronizando</span> : <span className="flex items-center gap-1 text-[7px] font-black text-emerald-500 uppercase tracking-tighter"><CloudCheck size={8} /> Protegido</span>}
              </div>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex flex-col items-center">
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Custo KM</span>
             <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">R$ {results.costPerKm.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}</button>
             <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`${activeTab === 'daily' ? 'block' : 'hidden'} lg:block lg:col-span-5`}>
             <DailyLog entries={costs.dailyEntries || []} onAdd={(e) => setCosts(p => ({...p, dailyEntries: [e, ...p.dailyEntries]}))} onUpdate={(e) => setCosts(p => ({...p, dailyEntries: p.dailyEntries.map(x => x.id === e.id ? e : x)}))} onDelete={(id) => setCosts(p => ({...p, dailyEntries: p.dailyEntries.filter(x => x.id !== id)}))} />
          </div>

          <div className={`${(activeTab === 'dashboard' || activeTab === 'history' || activeTab === 'calc') ? 'block' : 'hidden'} lg:block lg:col-span-7 space-y-6`}>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <Dashboard results={results} costs={costs} onSync={() => setActiveTab('calc')} onSave={handleSaveHistory} />
                <AIAssistant results={results} costs={costs} />
              </div>
            )}
            
            {activeTab === 'history' && (
              <HistoryView history={history} onDelete={handleDeleteHistory} />
            )}

            {activeTab === 'calc' && (
              <CalculatorForm costs={costs} onChange={setCosts} />
            )}
          </div>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t dark:border-slate-800 px-4 py-3 z-50 safe-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => setActiveTab('daily')} className={`flex flex-col items-center gap-1 ${activeTab === 'daily' ? 'text-indigo-600' : 'text-slate-400'}`}><CalendarDays className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Diário</span></button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Resumo</span></button>
          <button onClick={() => setActiveTab('calc')} className={`flex flex-col items-center gap-1 ${activeTab === 'calc' ? 'text-indigo-600' : 'text-slate-400'}`}><Calculator className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Ajustes</span></button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}><History className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Histórico</span></button>
        </div>
      </nav>
    </div>
  );
};

export default App;
