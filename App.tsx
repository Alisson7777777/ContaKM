
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { CalculatorForm } from './components/CalculatorForm';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { HistoryView } from './components/HistoryView';
import { DailyLog } from './components/DailyLog';
import { Auth } from './components/Auth';
import { DriverCosts, CalculationResults, CategoryBreakdown, HistoryRecord, DailyEntry } from './types';
import { Calculator, LayoutDashboard, Moon, Sun, History, CalendarDays, LogOut, Loader2, MapPin, CloudCheck, CloudUpload, Zap } from 'lucide-react';

const THEME_KEY = 'motorista_lucrativo_theme';

const INITIAL_COSTS: DriverCosts = {
  fuelPrice: 5.89,
  consumption: 10,
  isGnvEnabled: false,
  gnvPrice: 4.49,
  gnvConsumption: 13,
  monthlyMileage: 3000,
  maintenance: 250,
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
  targetProfitPerKm: 1.00,
  dailyEntries: [],
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Ref para evitar salvamento antes de carregar
  const isDataLoaded = useRef(false);

  const [costs, setCosts] = useState<DriverCosts>(INITIAL_COSTS);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [activeTab, setActiveTab] = useState<'calc' | 'dashboard' | 'daily' | 'history' | 'ai'>('daily');

  // Controle de Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        isDataLoaded.current = false;
        fetchUserData(session.user.id);
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
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Criando novo perfil de dados para o usuário.');
          isDataLoaded.current = true;
          return;
        }
        throw error;
      }
      
      if (data) {
        if (data.costs) setCosts(data.costs);
        if (data.history) setHistory(data.history);
        setLastSaved(new Date(data.updated_at));
      }
      isDataLoaded.current = true;
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Salvamento Automático (Debounced)
  useEffect(() => {
    // Só salva se houver sessão, não estiver carregando E os dados já foram baixados do banco uma vez
    if (!session || loading || !isDataLoaded.current) return;

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
          }, { onConflict: 'user_id' });

        if (error) throw error;
        setLastSaved(new Date());
      } catch (err: any) {
        console.error('Erro ao salvar no banco:', err.message || err);
      } finally {
        setSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [costs, history, session, loading]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const results: CalculationResults = useMemo(() => {
    const activeCosts = costs;
    const km = activeCosts.monthlyMileage || 1;
    
    // Soma os itens de manutenção se existirem, senão usa o valor manual
    const totalMaintenance = activeCosts.maintenanceItems && activeCosts.maintenanceItems.length > 0
      ? activeCosts.maintenanceItems.reduce((acc, item) => acc + item.value, 0)
      : activeCosts.maintenance;

    let fuelCostPerKm = 0;
    if (activeCosts.isGnvEnabled) {
      fuelCostPerKm = activeCosts.gnvConsumption > 0 ? activeCosts.gnvPrice / activeCosts.gnvConsumption : 0;
    } else {
      fuelCostPerKm = activeCosts.consumption > 0 ? activeCosts.fuelPrice / activeCosts.consumption : 0;
    }
    const fuelCostMonthly = activeCosts.monthlyMileage * fuelCostPerKm;
    
    const monthlyTaxes = activeCosts.isRented ? 0 : (activeCosts.annualIpva + activeCosts.annualLicensing) / 12;
    const insurance = activeCosts.isRented ? 0 : activeCosts.insurance;
    const depreciation = activeCosts.isRented ? 0 : activeCosts.depreciation;
    const loanOrRental = activeCosts.isRented ? activeCosts.rentalCost : activeCosts.loanPayment;
    const loanOrRentalLabel = activeCosts.isRented ? 'Aluguel' : 'Financiamento';

    const fuelLabel = activeCosts.isGnvEnabled ? 'Combustível (GNV)' : 'Combustível';
    const othersLabel = activeCosts.othersName.trim() || 'Outros Custos';
    
    const categories: CategoryBreakdown[] = [
      { name: fuelLabel, monthly: fuelCostMonthly, perKm: fuelCostPerKm, color: '#6366f1', percentage: 0 },
      { name: 'Veículo (Taxas/Seg)', monthly: insurance + monthlyTaxes, perKm: (insurance + monthlyTaxes) / km, color: '#10b981', percentage: 0 },
      { name: 'Manut/Deprec/Limpeza', monthly: totalMaintenance + depreciation + activeCosts.cleaning, perKm: (totalMaintenance + depreciation + activeCosts.cleaning) / km, color: '#f59e0b', percentage: 0 },
      { name: loanOrRentalLabel, monthly: loanOrRental, perKm: loanOrRental / km, color: '#ef4444', percentage: 0 },
      { name: 'Viver/Dados', monthly: activeCosts.foodExpenses + activeCosts.dataPlan, perKm: (activeCosts.foodExpenses + activeCosts.dataPlan) / km, color: '#ec4899', percentage: 0 },
      { name: othersLabel, monthly: activeCosts.others + activeCosts.appFees, perKm: (activeCosts.others + activeCosts.appFees) / km, color: '#94a3b8', percentage: 0 },
    ];

    const totalMonthlyCost = categories.reduce((acc, cat) => acc + cat.monthly, 0);
    const costPerKm = totalMonthlyCost / km;
    const suggestedMinFarePerKm = costPerKm + activeCosts.targetProfitPerKm;
    const profitMarginPercentage = suggestedMinFarePerKm > 0 ? (activeCosts.targetProfitPerKm / suggestedMinFarePerKm) * 100 : 0;

    const breakdown = categories.map(cat => ({
      ...cat,
      percentage: totalMonthlyCost > 0 ? (cat.monthly / totalMonthlyCost) * 100 : 0
    }));

    return {
      fuelCostMonthly,
      fuelCostPerKm,
      totalMonthlyCost,
      costPerKm,
      suggestedMinFarePerKm,
      profitMarginPercentage,
      breakdown
    };
  }, [costs]);

  const onAddDailyEntry = (entry: DailyEntry) => {
    setCosts(prev => ({
      ...prev,
      dailyEntries: [entry, ...(prev.dailyEntries || [])]
    }));
  };

  const onUpdateDailyEntry = (updatedEntry: DailyEntry) => {
    setCosts(prev => ({
      ...prev,
      dailyEntries: prev.dailyEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
    }));
  };

  const onDeleteDailyEntry = (id: string) => {
    setCosts(prev => ({
      ...prev,
      dailyEntries: prev.dailyEntries.filter(e => e.id !== id)
    }));
  };

  const onSyncDailyToAjustes = () => {
    const entries = costs.dailyEntries || [];
    const totalKm = entries.reduce((acc, e) => acc + (e.kmDriven || 0), 0);
    const totalFood = entries.reduce((acc, e) => acc + (e.foodSpent || 0), 0);
    const totalWash = entries.reduce((acc, e) => acc + (e.washSpent || 0), 0);
    const totalOthers = entries.reduce((acc, e) => acc + (e.parkingSpent || 0) + (e.tollsSpent || 0) + (e.otherSpent || 0), 0);

    setCosts(prev => ({
      ...prev,
      monthlyMileage: totalKm || prev.monthlyMileage,
      foodExpenses: totalFood || prev.foodExpenses,
      cleaning: totalWash || prev.cleaning,
      others: totalOthers || prev.others,
    }));
    
    setActiveTab('calc');
  };

  const onSaveHistory = () => {
    const now = new Date();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: now.getTime(),
      month: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      costPerKm: results.costPerKm,
      totalMonthlyCost: results.totalMonthlyCost,
      monthlyMileage: costs.monthlyMileage,
      suggestedMinFarePerKm: results.suggestedMinFarePerKm,
      isGnv: costs.isGnvEnabled,
      isRented: costs.isRented
    };
    setHistory(prev => [record, ...prev]);
    setActiveTab('history');
  };

  const onDeleteHistoryRecord = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Acessando sua conta...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onLogin={(user) => setSession({ user })} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20 lg:pb-0">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          {/* Esquerda: Logo e Sync */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-xs sm:text-base font-black text-slate-800 dark:text-slate-100 leading-none">ContaKM</h1>
              <div className="mt-0.5 h-3 flex items-center">
                {syncing ? (
                  <span className="flex items-center gap-1 text-[7px] font-black text-indigo-500 uppercase tracking-tighter">
                    <CloudUpload size={8} className="animate-bounce" /> Sincronizando
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1 text-[7px] font-black text-emerald-500 uppercase tracking-tighter">
                    <CloudCheck size={8} /> Salvo
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Centro: Custo por KM (Visível em tudo) */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-slate-100 dark:bg-slate-800 px-3 sm:px-6 py-1 sm:py-2 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col items-center transition-all group hover:border-indigo-300 dark:hover:border-indigo-800">
               <span className="text-[7px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Custo KM</span>
               <div className="flex items-baseline gap-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400">R$</span>
                  <span className="text-sm sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{results.costPerKm.toFixed(2)}</span>
               </div>
            </div>
          </div>
          
          {/* Direita: Opções */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
             <div className="flex items-center gap-0.5 sm:gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl border dark:border-slate-700 shadow-sm">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                >
                  {darkMode ? <Sun size={16} className="text-amber-400 sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
                <div className="w-px h-5 sm:h-6 bg-slate-100 dark:bg-slate-700 mx-0.5"></div>
                <button 
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-all"
                >
                  <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          <div className={`${activeTab === 'daily' ? 'block' : 'hidden'} lg:block lg:col-span-5`}>
             <DailyLog 
               entries={costs.dailyEntries || []} 
               onAdd={onAddDailyEntry} 
               onUpdate={onUpdateDailyEntry}
               onDelete={onDeleteDailyEntry}
             />
          </div>

          <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} lg:block lg:col-span-7 space-y-6`}>
            <Dashboard 
              results={results} 
              costs={costs} 
              onSave={onSaveHistory} 
              onSync={onSyncDailyToAjustes}
            />
            <AIAssistant results={results} costs={costs} />
          </div>

          <div className={`${activeTab === 'calc' ? 'block' : 'hidden'} lg:hidden col-span-12`}>
             <CalculatorForm costs={costs} onChange={setCosts} />
          </div>

          <div className={`${activeTab === 'history' ? 'block' : 'hidden'} lg:hidden col-span-12`}>
             <HistoryView history={history} onDelete={onDeleteHistoryRecord} />
          </div>

          <div className={`${activeTab === 'ai' ? 'block' : 'hidden'} lg:hidden col-span-12`}>
             <AIAssistant results={results} costs={costs} />
          </div>

          <div className="hidden lg:block lg:col-span-12 mt-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <CalculatorForm costs={costs} onChange={setCosts} />
                <HistoryView history={history} onDelete={onDeleteHistoryRecord} />
             </div>
          </div>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t dark:border-slate-800 px-4 py-3 z-50 safe-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => setActiveTab('daily')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'daily' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`p-1 rounded-lg ${activeTab === 'daily' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}><CalendarDays className={`w-6 h-6 ${activeTab === 'daily' ? 'scale-110' : ''}`} /></div>
            <span className="text-[10px] font-bold">Diário</span>
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}><LayoutDashboard className={`w-6 h-6 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} /></div>
            <span className="text-[10px] font-bold">Resumo</span>
          </button>
          <button onClick={() => setActiveTab('calc')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'calc' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`p-1 rounded-lg ${activeTab === 'calc' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}><Calculator className={`w-6 h-6 ${activeTab === 'calc' ? 'scale-110' : ''}`} /></div>
            <span className="text-[10px] font-bold">Ajustes</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`p-1 rounded-lg ${activeTab === 'history' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}><History className={`w-6 h-6 ${activeTab === 'history' ? 'scale-110' : ''}`} /></div>
            <span className="text-[10px] font-bold">Histórico</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
