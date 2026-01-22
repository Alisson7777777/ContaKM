
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calculator, Mail, Lock, User, ArrowRight, Sparkles, LogIn, UserPlus, Loader2, MapPin, ChevronLeft, CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

type AuthMode = 'login' | 'signup' | 'reset' | 'update_password' | 'forgot_email';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setError('');
        setMessage('');
      }
    });

    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setMode('update_password');
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) onLogin(data.user);
      } 
      else if (mode === 'signup') {
        if (!name) throw new Error('O nome é obrigatório para sua segurança.');
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        if (data.user) onLogin(data.user);
      } 
      else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage('Link de segurança enviado! Olhe seu e-mail (e a pasta de spam).');
      }
      else if (mode === 'update_password') {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage('Senha atualizada com sucesso! Você já pode entrar.');
        setMode('login');
        setPassword('');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.message.includes('Invalid login credentials')) friendlyError = 'E-mail ou senha incorretos.';
      if (err.message.includes('User already registered')) friendlyError = 'Este e-mail já possui uma conta.';
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-[2rem] shadow-xl text-white mb-6 relative group">
            <Calculator size={40} className="group-hover:scale-105 transition-transform" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 bg-emerald-500 rounded-full p-1.5 border-4 border-indigo-600">
              <ShieldCheck size={18} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic">ContaKM</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Segurança de dados e lucro real para motoristas.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-500"><Sparkles size={120} /></div>

          {mode === 'forgot_email' ? (
            <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
              <button onClick={() => setMode('login')} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4"><ChevronLeft size={14} /> Voltar</button>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Dica de Segurança</h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl text-left border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">Não exibimos seu e-mail publicamente. Tente:</p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc ml-5">
                  <li>Buscar por <strong>"Supabase"</strong> no seu e-mail principal.</li>
                  <li>Verificar o e-mail que você usa para a Uber/99.</li>
                </ul>
              </div>
              <button onClick={() => setMode('login')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest">Tentar Novamente</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {(mode === 'reset' || mode === 'update_password') && (
                <button type="button" onClick={() => setMode('login')} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest"><ChevronLeft size={14} /> Cancelar</button>
              )}

              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {mode === 'login' && 'Bem-vindo de volta'}
                {mode === 'signup' && 'Começar a lucrar'}
                {mode === 'reset' && 'Recuperar Acesso'}
                {mode === 'update_password' && 'Nova Senha'}
              </h2>

              {error && <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center">{error}</div>}
              {message && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">{message}</div>}

              {mode === 'signup' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all" placeholder="Nome completo" />
                  </div>
                </div>
              )}

              {mode !== 'update_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail</label>
                    {mode === 'login' && <button type="button" onClick={() => setMode('forgot_email')} className="text-[9px] font-black uppercase text-slate-400 hover:text-indigo-500">Esqueci meu e-mail</button>}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all" placeholder="seu@email.com" />
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mode === 'update_password' ? 'Nova Senha' : 'Senha'}</label>
                    {mode === 'login' && <button type="button" onClick={() => setMode('reset')} className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-600">Esqueceu a senha?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all" placeholder="Senha segura" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 group mt-4">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>{mode === 'login' ? 'Entrar Agora' : mode === 'signup' ? 'Criar Conta' : mode === 'reset' ? 'Enviar E-mail' : 'Salvar Senha'}<ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {mode !== 'forgot_email' && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2 justify-center w-full">
                {mode === 'login' ? <><UserPlus size={14} /> Não tem conta? Cadastre-se</> : <><LogIn size={14} /> Já tem conta? Faça login</>}
              </button>
            </div>
          )}
        </div>
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">© {new Date().getFullYear()} ContaKM • Segurança Nível Bancário</p>
      </div>
    </div>
  );
};
