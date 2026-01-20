
import React, { useState } from 'react';
import { DriverCosts, MaintenanceItem } from '../types';
import { Fuel, Gauge, MapPin, Wrench, Shield, FileText, TrendingDown, Bath, Smartphone, PlusCircle, Target, Info, Zap, CreditCard, Utensils, PenLine, RefreshCw, Key, Plus, Trash2 } from 'lucide-react';

interface Props {
  costs: DriverCosts;
  onChange: (costs: DriverCosts) => void;
}

const InputField = ({ 
  label, 
  name, 
  value, 
  icon: Icon, 
  unit, 
  help, 
  isSynced,
  disabled,
  onChange 
}: { 
  label: string, 
  name: string, 
  value: number, 
  icon: any, 
  unit: string, 
  help?: string,
  isSynced?: boolean,
  disabled?: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className={`mb-5 group ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">{label}</label>
        {isSynced && !disabled && (
          <span className="flex items-center gap-1 text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
            <RefreshCw size={8} /> Sincronizado
          </span>
        )}
      </div>
      {help && !disabled && (
        <div className="relative flex items-center">
          <div className="peer cursor-help p-1">
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] leading-relaxed rounded-2xl opacity-0 peer-hover:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-slate-700">
            {help}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        name={name}
        disabled={disabled}
        value={value === 0 ? '' : value}
        onChange={onChange}
        placeholder="0.00"
        className={`block w-full pl-12 pr-14 py-4 ${isSynced ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60'} border-2 rounded-2xl text-slate-900 dark:text-slate-100 font-bold text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none`}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 text-[10px] font-black uppercase tracking-tighter">
        {unit}
      </div>
    </div>
  </div>
);

const TextInputField = ({ 
  label, 
  name, 
  value, 
  icon: Icon, 
  placeholder,
  onChange 
}: { 
  label: string, 
  name: string, 
  value: string, 
  icon: any, 
  placeholder: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="mb-5 group">
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl text-slate-900 dark:text-slate-100 font-bold text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
      />
    </div>
  </div>
);

export const CalculatorForm: React.FC<Props> = ({ costs, onChange }) => {
  const [newMaint, setNewMaint] = useState({ description: '', value: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({ 
      ...costs, 
      [name]: type === 'checkbox' ? checked : (type === 'text' ? value : (value === '' ? 0 : parseFloat(value))) 
    });
  };

  const addMaintenanceItem = () => {
    if (!newMaint.description || !newMaint.value) return;
    const item: MaintenanceItem = {
      id: crypto.randomUUID(),
      description: newMaint.description,
      value: parseFloat(newMaint.value) || 0
    };
    const items = [...(costs.maintenanceItems || []), item];
    onChange({ ...costs, maintenanceItems: items });
    setNewMaint({ description: '', value: '' });
  };

  const removeMaintenanceItem = (id: string) => {
    const items = (costs.maintenanceItems || []).filter(i => i.id !== id);
    onChange({ ...costs, maintenanceItems: items });
  };

  const totalMaintenance = costs.maintenanceItems && costs.maintenanceItems.length > 0
    ? costs.maintenanceItems.reduce((acc, item) => acc + item.value, 0)
    : costs.maintenance;

  const hasDailyEntries = (costs.dailyEntries || []).length > 0;

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Sua Meta</h3>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-5 rounded-[2rem] border-2 border-emerald-50 dark:border-emerald-900/20">
          <InputField 
            label="Lucro Limpo por KM" 
            name="targetProfitPerKm" 
            value={costs.targetProfitPerKm} 
            icon={Target} 
            unit="R$" 
            help="Quanto você quer que sobre de lucro real no seu bolso por KM após todas as despesas."
            onChange={handleChange}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Posse do Veículo</h3>
        </div>
        <div className="bg-amber-50/30 dark:bg-amber-950/10 p-5 rounded-[2rem] border border-amber-50/50 dark:border-amber-900/20 space-y-4">
          <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
            <div className="relative">
              <input 
                type="checkbox" 
                name="isRented" 
                checked={costs.isRented} 
                onChange={handleChange} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </div>
            <div className="flex items-center gap-2">
              <Key size={16} className={costs.isRented ? "text-amber-500" : "text-slate-400"} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Meu carro é ALUGADO</span>
            </div>
          </label>
          
          {costs.isRented && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <InputField 
                label="Valor do Aluguel (Mensal)" 
                name="rentalCost" 
                value={costs.rentalCost} 
                icon={CreditCard} 
                unit="R$" 
                help="Soma de todas as semanas ou mensalidade da locadora."
                onChange={handleChange} 
              />
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tight ml-1 -mt-2 mb-2">
                * IPVA, Seguro e Depreciação serão ignorados automaticamente.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Configurações de Base</h3>
        </div>
        <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-5 rounded-[2rem] border border-indigo-50/50 dark:border-indigo-900/20 space-y-6">
          <InputField label="Preço Médio do Litro (Gaso/Etanol)" name="fuelPrice" value={costs.fuelPrice} icon={Fuel} unit="R$/L" onChange={handleChange} />
          
          <InputField label="KM por Litro (Estimado)" name="consumption" value={costs.consumption} icon={Gauge} unit="KM/L" help="Consumo médio na gasolina/etanol." onChange={handleChange} />
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-4 cursor-pointer group mb-6 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="isGnvEnabled" 
                  checked={costs.isGnvEnabled} 
                  onChange={handleChange} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className={costs.isGnvEnabled ? "text-indigo-500" : "text-slate-400"} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Meu carro tem GNV</span>
              </div>
            </label>

            {costs.isGnvEnabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <InputField 
                  label="Preço do m³ do GNV" 
                  name="gnvPrice" 
                  value={costs.gnvPrice} 
                  icon={Zap} 
                  unit="R$/m³" 
                  help="Preço que você paga no posto de GNV."
                  onChange={handleChange} 
                />
                <InputField 
                  label="KM por m³ (GNV)" 
                  name="gnvConsumption" 
                  value={costs.gnvConsumption} 
                  icon={Gauge} 
                  unit="KM/m³" 
                  help="Quantos quilômetros seu carro roda com 1m³ de gás."
                  onChange={handleChange} 
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <InputField 
              label="KM Mensal" 
              name="monthlyMileage" 
              value={costs.monthlyMileage} 
              icon={MapPin} 
              unit="KM" 
              isSynced={hasDailyEntries}
              help={hasDailyEntries ? "Este valor pode ser atualizado automaticamente clicando em 'Importar Real' no Resumo." : "Média de KM que você roda no mês."}
              onChange={handleChange} 
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Despesas Fixas e Variáveis</h3>
        </div>
        <div className="space-y-1">
          <InputField 
            label="Prestação / Financiamento" 
            name="loanPayment" 
            value={costs.loanPayment} 
            disabled={costs.isRented}
            icon={CreditCard} 
            unit="R$" 
            onChange={handleChange} 
          />
          <InputField 
            label="Alimentação / Gastos Trabalho" 
            name="foodExpenses" 
            value={costs.foodExpenses} 
            icon={Utensils} 
            unit="R$" 
            isSynced={hasDailyEntries}
            help={hasDailyEntries ? "Valor total acumulado do seu diário de turnos." : "Sua média de gastos mensais com alimentação na rua."}
            onChange={handleChange} 
          />
          <InputField 
            label="IPVA (Anual)" 
            name="annualIpva" 
            value={costs.annualIpva} 
            disabled={costs.isRented}
            icon={FileText} 
            unit="R$" 
            onChange={handleChange} 
          />
          <InputField 
            label="Licenciamento (Anual)" 
            name="annualLicensing" 
            value={costs.annualLicensing} 
            disabled={costs.isRented}
            icon={Shield} 
            unit="R$" 
            onChange={handleChange} 
          />
          <InputField 
            label="Seguro (Mensal)" 
            name="insurance" 
            value={costs.insurance} 
            disabled={costs.isRented}
            icon={Shield} 
            unit="R$" 
            onChange={handleChange} 
          />

          {/* Seção de Manutenção Detalhada - Layout Responsivo Otimizado */}
          <div className="mb-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-3xl group transition-all">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
               <div className="flex items-center gap-2">
                 <Wrench size={16} className="text-indigo-500" />
                 <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Detalhamento de Manutenção</h4>
               </div>
               <span className="self-start sm:self-auto text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                 R$ {totalMaintenance.toFixed(2)}
               </span>
             </div>

             <div className="space-y-2 mb-5 max-h-[250px] overflow-y-auto no-scrollbar">
               {(costs.maintenanceItems || []).map(item => (
                 <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-left-2 fade-in duration-200">
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.description}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">R$ {item.value.toFixed(2)}</span>
                    </div>
                    <button onClick={() => removeMaintenanceItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all shrink-0">
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
               {(costs.maintenanceItems || []).length === 0 && !costs.maintenance && (
                 <p className="text-[10px] text-slate-400 font-medium italic text-center py-2 uppercase tracking-tighter">Nenhum item detalhado ainda.</p>
               )}
               {(costs.maintenanceItems || []).length === 0 && costs.maintenance > 0 && (
                 <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">Valor manual ativo: R$ {costs.maintenance.toFixed(2)}</p>
                 </div>
               )}
             </div>

             <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Descrição</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Troca de Óleo" 
                      value={newMaint.description}
                      onChange={e => setNewMaint({...newMaint, description: e.target.value})}
                      className="w-full px-4 py-3.5 text-sm bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Valor (R$)</label>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="0.00" 
                      value={newMaint.value}
                      onChange={e => setNewMaint({...newMaint, value: e.target.value})}
                      className="w-full px-4 py-3.5 text-sm bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-bold transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={addMaintenanceItem}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none"
                >
                  <Plus size={18} />
                  Adicionar à Manutenção
                </button>
             </div>
          </div>

          <InputField 
            label="Depreciação" 
            name="depreciation" 
            value={costs.depreciation} 
            disabled={costs.isRented}
            icon={TrendingDown} 
            unit="R$" 
            help="O quanto seu carro desvaloriza por mês." 
            onChange={handleChange} 
          />
          <InputField label="Lavagem / Limpeza" name="cleaning" value={costs.cleaning} icon={Bath} isSynced={hasDailyEntries} unit="R$" onChange={handleChange} />
          <InputField label="Plano de Dados" name="dataPlan" value={costs.dataPlan} icon={Smartphone} unit="R$" onChange={handleChange} />
          
          <div className="pt-6 mt-6 border-t-2 border-slate-100 dark:border-slate-800">
            <TextInputField 
              label="Nome do Outro Custo" 
              name="othersName" 
              value={costs.othersName} 
              icon={PenLine} 
              placeholder="Ex: Estacionamento, MEI..." 
              onChange={handleChange} 
            />
            <InputField 
              label="Valor do Outro Custo" 
              name="others" 
              value={costs.others} 
              icon={PlusCircle} 
              unit="R$" 
              isSynced={hasDailyEntries}
              help="Soma de Pedágios, Estacionamentos e 'Outros' do diário."
              onChange={handleChange} 
            />
          </div>
        </div>
      </section>
    </div>
  );
};
