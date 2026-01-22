
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CalculationResults, DriverCosts } from '../types';
import { Loader2, RefreshCw, TrendingUp, Calculator, ShieldCheck } from 'lucide-react';

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
      
      const prompt = `
        Realize uma AUDITORIA CONTÁBIL ESTRATÉGICA com base nos seguintes dados operacionais:
        
        MÉTRICAS:
        - Custo por KM: R$ ${results.costPerKm.toFixed(2)}
        - Custo por Hora: R$ ${results.costPerHour.toFixed(2)}
        - Tarifa Mínima Sugerida (Lucro): R$ ${results.suggestedMinFarePerKm.toFixed(2)}/KM
        - Meta de Lucro Mensal: R$ ${(costs.monthlyMileage * costs.targetProfitPerKm).toFixed(2)}
        - Ponto de Equilíbrio Diário (Sair do zero): R$ ${results.breakEvenDaily.toFixed(2)}
        - Combustível: ${costs.isGnvEnabled ? 'GNV' : 'Gasolina/Etanol'}
        
        ESTRUTURA DA RESPOSTA (Seja direto e numérico):
        1. DIAGNÓSTICO DE VIABILIDADE: Avalie se a meta de lucro de R$ ${costs.targetProfitPerKm.toFixed(2)}/KM é sustentável perante o custo operacional.
        2. ANÁLISE DE TEMPO: Avalie o faturamento por hora necessário vs jornada de ${costs.workHoursPerDay}h.
        3. OTIMIZAÇÃO: Cite 2 pontos de maior peso nos custos fixos ou variáveis que podem ser otimizados.
        
        REGRAS: 
        - Resposta curta e estritamente profissional.
        - Foco em contabilidade de transporte.
        - Não dê conselhos de direção ou aplicativos específicos.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Não foi possível processar a auditoria contábil.");
    } catch (error) {
      console.error(error);
      setAdvice("Falha técnica na conexão com o auditor de IA.");
    } finally {
      setLoading(false);
    }
  }, [results, costs]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><ShieldCheck size={140} className="text-indigo-600" /></div>
      
      <div className="p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 italic">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              Auditoria de Rentabilidade
            </h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Análise Contábil by Gemini Intelligence</p>
          </div>
          <button 
            onClick={getAdvice} 
            disabled={loading}
            className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90 ${loading ? 'opacity-50' : 'hover:bg-indigo-600 hover:text-white'}`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {!advice && !loading && (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <TrendingUp className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mb-6">Sua operação é matematicamente viável?</p>
            <button onClick={getAdvice} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">
              Iniciar Auditoria Técnica
            </button>
          </div>
        )}

        {loading && (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Calculando riscos e margens...</p>
          </div>
        )}

        {advice && !loading && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium bg-slate-50 dark:bg-slate-950/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
              {advice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
