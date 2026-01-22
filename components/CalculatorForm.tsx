
import React, { useState, useEffect } from 'react';
import { DriverCosts, CostItem } from '../types';
import { Fuel, Key, Target, Gauge, Wrench, Shield, CreditCard, Utensils, Smartphone, Sparkles, TrendingDown, Zap, Plus, Trash2, List, Clock, Calendar } from 'lucide-react';

interface Props {
  costs: DriverCosts;
  onChange: (updater: (prev: DriverCosts) => DriverCosts) => void;
}

const StableInput = ({ name, value, onChange, placeholder, isCurrency, className, icon: Icon, suffix }: any) => {
  // Ensure we don't call toString on undefined
  const safeValue = (value === undefined || value === null) ? 0 : value;
  const [localValue, setLocalValue] = useState<string>(safeValue === 0 ? '' : safeValue.toString());

  useEffect(() => {
    const numericLocal = parseFloat(localValue) || 0;
    const currentSafeValue = (value === undefined || value === null) ? 0 : value;
    if (numericLocal !== currentSafeValue) {
      setLocalValue(currentSafeValue === 0 ? '' : currentSafeValue.toString());
    }
  }, [value]);

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(',', '.');
    const filteredVal = val.replace(/[^0-9.]/g, '');
    const parts = filteredVal.split('.');
    const finalVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filteredVal;
    setLocalValue(finalVal);
    const numericValue = finalVal === '' ? 0 : parseFloat(finalVal);
    if (!isNaN(numericValue)) {
      onChange(name, numericValue);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
        <Icon size={18} />
      </div>
      {isCurrency && (
        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 pointer-events-none">
          R$
        </span>
      )}
      <input 
        type="text" 
        inputMode="decimal"
        name={name} 
        value={localValue} 
        onChange={handleLocalChange} 
        placeholder={placeholder}
        className={`${className} ${isCurrency ? 'pl-[4.5rem]' : 'pl-11'}`} 
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className={`p-1.5 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
      <Icon size={16} className={color.replace('bg-', 'text-')} />
    </div>
    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
  </div>
);

const InputGroup = ({ label, name, value, icon, suffix, placeholder, isCurrency = false, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <StableInput 
      name={name}
      value={value}
      onChange={onChange}
      icon={icon}
      suffix={suffix}
      placeholder={placeholder}
      isCurrency={isCurrency}
      className="w-full pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 transition-all text-sm"
    />
  </div>
);

const ItemListManager = ({ items, onUpdate, label, icon: Icon }: { items: CostItem[], onUpdate: (newItems: CostItem[]) => void, label: string, icon: any }) => {
  const addItem = () => {
    onUpdate([...items, { id: crypto.randomUUID(), description: '', value: 0 }]);
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: 'description' | 'value', val: any) => {
    onUpdate(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/20 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-indigo-500" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
        </div>
        <button 
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhum item detalhado.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <input 
                type="text" 
                value={item.description} 
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Ex: Troca de Óleo"
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
              <div className="relative w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">R$</span>
                <input 
                  type="number" 
                  value={item.value === 0 ? '' : item.value} 
                  onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-7 pr-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {items.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-slate-400">Total Detalhado</span>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            R$ {items.reduce((acc, i) => acc + i.value, 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export const CalculatorForm: React.FC<Props> = ({ costs, onChange }) => {
  const handleFieldChange = (name: string, value: any) => {
    onChange(prev => ({ 
      ...prev, 
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange(prev => ({ 
      ...prev, 
      [name]: checked
    }));
  };

  const handleUpdateItems = (field: 'maintenanceItems' | 'othersItems', totalField: 'maintenance' | 'others', items: CostItem[]) => {
    const total = items.reduce((sum, i) => sum + i.value, 0);
    onChange(prev => ({
      ...prev,
      [field]: items,
      [totalField]: total
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <SectionTitle icon={Target} title="Operação e Meta" color="bg-indigo-500" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup label="Meta de Lucro Líquido" name="targetProfitPerKm" value={costs.targetProfitPerKm} icon={TrendingDown} suffix="/KM" placeholder="1.00" isCurrency onChange={handleFieldChange} />
          <InputGroup label="KM Mensal Estimado" name="monthlyMileage" value={costs.monthlyMileage} icon={Gauge} suffix="KM" placeholder="3000" onChange={handleFieldChange} />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <SectionTitle icon={Clock} title="Jornada de Trabalho" color="bg-blue-500" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup label="Horas por Dia" name="workHoursPerDay" value={costs.workHoursPerDay} icon={Clock} suffix="Hrs" placeholder="10" onChange={handleFieldChange} />
          <InputGroup label="Dias por Semana" name="workDaysPerWeek" value={costs.workDaysPerWeek} icon={Calendar} suffix="Dias" placeholder="6" onChange={handleFieldChange} />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <SectionTitle icon={Fuel} title="Posse do Veículo" color="bg-emerald-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="isRented" checked={costs.isRented} onChange={handleCheckboxChange} className="peer appearance-none w-6 h-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 transition-all" />
                <Key size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">O carro é alugado</span>
            </label>
            {costs.isRented ? (
              <InputGroup label="Valor do Aluguel" name="rentalCost" value={costs.rentalCost} icon={CreditCard} suffix="Mês" placeholder="2400" isCurrency onChange={handleFieldChange} />
            ) : (
              <InputGroup label="Parcela do Carro" name="loanPayment" value={costs.loanPayment} icon={CreditCard} suffix="Mês" placeholder="0" isCurrency onChange={handleFieldChange} />
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="isGnvEnabled" checked={costs.isGnvEnabled} onChange={handleCheckboxChange} className="peer appearance-none w-6 h-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg checked:bg-emerald-600 checked:border-emerald-600 transition-all" />
                <Zap size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Uso GNV no veículo</span>
            </label>
            {costs.isGnvEnabled ? (
              <div className="grid grid-cols-1 gap-4">
                <InputGroup label="Preço GNV" name="gnvPrice" value={costs.gnvPrice} icon={Fuel} suffix="m³" placeholder="4.49" isCurrency onChange={handleFieldChange} />
                <InputGroup label="Consumo GNV" name="gnvConsumption" value={costs.gnvConsumption} icon={Gauge} suffix="KM/m³" placeholder="13" onChange={handleFieldChange} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[72px] opacity-20 italic text-[10px] font-bold text-slate-400 uppercase">
                GNV Desativado
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Fuel size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400">Combustível Líquido</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Preço Líquido" name="fuelPrice" value={costs.fuelPrice} icon={Fuel} suffix="L" placeholder="5.89" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Consumo Médio" name="consumption" value={costs.consumption} icon={Gauge} suffix="KM/L" placeholder="10" onChange={handleFieldChange} />
          </div>
        </div>
      </section>

      {!costs.isRented && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <SectionTitle icon={Shield} title="Taxas e Proteção" color="bg-amber-500" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="IPVA Anual" name="annualIpva" value={costs.annualIpva} icon={CreditCard} suffix="Ano" placeholder="1200" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Seguro Mensal" name="insurance" value={costs.insurance} icon={Shield} suffix="Mês" placeholder="180" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Licenciamento" name="annualLicensing" value={costs.annualLicensing} icon={CreditCard} suffix="Ano" placeholder="150" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Depreciação Mensal" name="depreciation" value={costs.depreciation} icon={TrendingDown} suffix="Mês" placeholder="400" isCurrency onChange={handleFieldChange} />
          </div>
        </section>
      )}

      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <SectionTitle icon={Sparkles} title="Manutenção e Outros" color="bg-rose-500" />
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Manutenção (Mês)</label>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">R$ {costs.maintenance.toFixed(2)}</span>
            </div>
            <ItemListManager label="Itens de Manutenção" items={costs.maintenanceItems || []} onUpdate={(items) => handleUpdateItems('maintenanceItems', 'maintenance', items)} icon={Wrench} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Alimentação" name="foodExpenses" value={costs.foodExpenses} icon={Utensils} suffix="Mês" placeholder="400" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Limpeza" name="cleaning" value={costs.cleaning} icon={Sparkles} suffix="Mês" placeholder="120" isCurrency onChange={handleFieldChange} />
            <InputGroup label="Plano de Dados" name="dataPlan" value={costs.dataPlan} icon={Smartphone} suffix="Mês" placeholder="50" isCurrency onChange={handleFieldChange} />
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outros Gastos (Mês)</label>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">R$ {costs.others.toFixed(2)}</span>
            </div>
            <ItemListManager label="Outros Custos Detalhados" items={costs.othersItems || []} onUpdate={(items) => handleUpdateItems('othersItems', 'others', items)} icon={List} />
          </div>
        </div>
      </section>
    </div>
  );
};
