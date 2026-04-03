import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const { signInLocal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const getErrorMessage = (err: any) => {
    const message = err.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials')) {
      return 'Błędny e-mail lub hasło. Spróbuj ponownie.';
    }
    if (message.includes('email not confirmed')) {
      return 'Twój adres e-mail nie został jeszcze potwierdzony. Sprawdź skrzynkę odbiorczą.';
    }
    if (message.includes('user already registered')) {
      return 'Ten adres e-mail jest już zarejestrowany w systemie.';
    }
    if (message.includes('password should be at least 6 characters')) {
      return 'Hasło musi składać się z co najmniej 6 znaków.';
    }
    if (message.includes('network request failed') || message.includes('failed to fetch')) {
      return 'Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.';
    }
    if (message.includes('rate limit exceeded')) {
      return 'Zbyt wiele prób. Spróbuj ponownie za chwilę.';
    }
    
    return err.message || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && fullName.trim().length < 3) {
      setError('Proszę podać pełne imię i nazwisko.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Try local login first for the specific admin account
      if (isLogin) {
        const success = await signInLocal(email, password);
        if (success) {
          setLoading(false);
          return;
        }
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase nie jest skonfigurowany. Możesz zalogować się tylko na konto Admin APP.');
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'uzytkownik'
            },
          },
        });
        if (error) throw error;
        setMessage('Rejestracja pomyślna! Sprawdź e-mail, aby potwierdzić konto.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl">
              <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Witaj ponownie' : 'Dołącz do OGrid'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Zaloguj się do swojego konta' : 'Utwórz nowe konto użytkownika'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imię i Nazwisko</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
                    placeholder="Jan Kowalski"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
                  placeholder="twoj@email.pl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                {message}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                <>
                  <LogIn size={20} />
                  Zaloguj się
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Zarejestruj się
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
