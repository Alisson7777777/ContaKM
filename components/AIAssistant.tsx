
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CalculationResults, DriverCosts } from '../types';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  results: CalculationResults;
  costs: DriverCosts;
}

export const AIAssistant: React.FC<Props> = ({ results, costs }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const fuelContext = costs.isGnvEnabled 
        ? `GNV habilitado: R$ ${costs.gnvPrice}/m³, Consumo: ${costs.gnvConsumption} KM/m³`
        : `Combustível Líquido: R$ ${costs.fuelPrice}/L, Consumo: ${costs.consumption} KM/L`;

      const ownershipContext = costs.isRented
        ? `Veículo ALUGADO (Custo: R$ ${costs.rentalCost}/mês). Não possui depreciação ou impostos diretos.`
        : `Veículo PRÓPRIO. Depreciação: R$ ${costs.depreciation}/mês, Impostos/Seguro: R$ ${(costs.insurance + (costs.annualIpva + costs.annualLicensing)/12).toFixed(2)}/mês.`;

      const prompt = `
        Aja como um consultor financeiro especialista para motoristas de aplicativo (Uber, 99).
        Dados atuais do motorista:
        - Situação: ${ownershipContext}
        - Custo Real por KM: R$ ${results.costPerKm.toFixed(2)}
        - Informação de Combustível: ${fuelContext}
        - KM Mensal Rodada: ${costs.monthlyMileage} KM
        - Manutenção: R$ ${costs.maintenance}/mês
        - Gastos Totais com Combustível: R$ ${results.fuelCostMonthly.toFixed(2)}/mês
        
        Com base nesses números, dê 3 dicas práticas, curtas e diretas em português para este motorista reduzir seus custos ou melhorar sua rentabilidade. 
        Leve em conta se o motorista usa GNV e se o carro é alugado (para alugados, foque em otimização de KM vs plano da locadora).
        Seja didático e use uma linguagem simples de "motorista para motorista".
        Não use introduções longas. Vá direto aos pontos em formato de lista.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Não foi possível gerar dicas no momento.");
    } catch (error) {
      console.error(error);
      setAdvice("Ops! Ocorreu um erro ao buscar dicas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [results, costs]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
         <Sparkles className="w-24 h-24" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            Consultoria IA
          </h3>
          {advice && (
            <button 
              onClick={getAdvice} 
              disabled={loading}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Gerar novas dicas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {!advice && !loading && (
          <div className="text-center py-4">
            <p className="text-indigo-100 mb-6 text-sm">Clique abaixo para receber uma análise personalizada dos seus custos baseada em IA.</p>
            <button
              onClick={getAdvice}
              className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
            >
              Analisar meu lucro
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-200 mb-3" />
            <p className="text-xs text-indigo-100 font-bold uppercase tracking-tighter">Consultando o especialista...</p>
          </div>
        )}

        {advice && !loading && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md text-sm leading-relaxed whitespace-pre-wrap border border-white/10 font-medium">
              {advice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
