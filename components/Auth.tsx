
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calculator, Mail, Lock, User, ArrowRight, Sparkles, LogIn, UserPlus, Loader2, MapPin, ChevronLeft, CheckCircle2, HelpCircle } from 'lucide-react';

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

  // Detecta se o usuário veio de um link de recuperação de senha
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) onLogin(data.user);
      } 
      else if (mode === 'signup') {
        if (!name) throw new Error('O nome é obrigatório.');
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
        setMessage('E-mail enviado! Verifique sua caixa de entrada e a pasta de spam.');
      }
      else if (mode === 'update_password') {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        if (updateError) throw updateError;
        setMessage('Senha atualizada com sucesso! Agora você já pode entrar.');
        setMode('login');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-200 dark:shadow-none text-white mb-6 relative group">
            <Calculator size={40} className="group-hover:scale-105 transition-transform" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 bg-amber-500 rounded-full p-1.5 border-4 border-indigo-600 shadow-lg">
              <MapPin size={18} className="text-white fill-white/20" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">ContaKM</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Sua liberdade financeira começa pelos números.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={120} />
          </div>

          {mode === 'forgot_email' ? (
            <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button 
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4"
              >
                <ChevronLeft size={14} /> Voltar ao Login
              </button>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Esqueceu seu e-mail?</h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-xl h-fit">
                    <HelpCircle className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Por segurança, não podemos exibir seu e-mail. Mas aqui vai uma dica:
                  </p>
                </div>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc ml-10">
                  <li>Procure na sua caixa de entrada por mensagens de <strong>"Supabase"</strong> ou <strong>"ContaKM"</strong>.</li>
                  <li>Verifique seus e-mails mais usados (Gmail, Outlook, etc).</li>
                  <li>Se você criou a conta recentemente, o e-mail de confirmação deve estar lá.</li>
                </ul>
              </div>
              <button 
                onClick={() => setMode('login')}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Entendi, vou procurar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {(mode === 'reset' || mode === 'update_password') && (
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4"
                >
                  <ChevronLeft size={14} /> Voltar ao Login
                </button>
              )}

              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                {mode === 'login' && 'Entrar na conta'}
                {mode === 'signup' && 'Criar nova conta'}
                {mode === 'reset' && 'Recuperar senha'}
                {mode === 'update_password' && 'Definir nova senha'}
              </h2>

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-in fade-in zoom-in duration-200">
                  {error.includes('credentials') ? 'E-mail ou senha incorretos.' : error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-in fade-in zoom-in duration-200 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  {message}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all"
                      placeholder="Como podemos te chamar?"
                    />
                  </div>
                </div>
              )}

              {mode !== 'update_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot_email')}
                        className="text-[9px] font-black uppercase text-slate-400 hover:text-indigo-500 tracking-tighter"
                      >
                        Esqueci meu e-mail
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {mode === 'update_password' ? 'Nova Senha' : 'Senha'}
                    </label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                        className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-600 tracking-tighter"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 group mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {mode === 'login' && 'Entrar Agora'}
                    {mode === 'signup' && 'Criar minha conta'}
                    {mode === 'reset' && 'Enviar Recuperação'}
                    {mode === 'update_password' && 'Salvar Nova Senha'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode !== 'forgot_email' && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              {mode === 'reset' || mode === 'update_password' ? (
                <button
                  onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-2 justify-center w-full"
                >
                  Voltar para o Login
                </button>
              ) : (
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-2 justify-center w-full"
                >
                  {mode === 'login' ? (
                    <span className="flex items-center gap-2"><UserPlus size={14} /> Não tem conta? Cadastre-se</span>
                  ) : (
                    <span className="flex items-center gap-2"><LogIn size={14} /> Já tem conta? Faça login</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} ContaKM • v1.2
        </p>
      </div>
    </div>
  );
};
