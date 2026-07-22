import React, { useState, useEffect } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabase, isConfigured } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Shield, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabaseAuthService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { unsubscribe } = supabaseAuthService.subscribeToAuthChanges((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isLoginView) {
        await supabaseAuthService.signIn(email, password);
      } else {
        await supabaseAuthService.signUp(email, password, name);
        // After signup, we might need to show a message if email confirmation is enabled, 
        // but for now we just try to log them in or show a generic message if session is still null
        const session = await supabaseAuthService.getSession();
        if (!session) {
          setAuthError('Cadastro realizado. Verifique seu e-mail para confirmar a conta.');
        }
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await supabaseAuthService.signInWithGoogle();
    } catch (error: any) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  // If Supabase is not configured, we can either block the app or let it pass with a warning.
  // For this context, if not configured, we'll let it pass or show a setup message.
  // We'll just render children so the user can configure it via the dashboard.
  if (!isConfigured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-8 rounded-3xl shadow-2xl shadow-indigo-900/5 w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm" />
              <Shield className="h-8 w-8 relative z-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Guardião Kids</h1>
            <p className="text-slate-500 text-sm mt-2 text-center font-medium">Sua família conectada e protegida.</p>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>
          
          <p className="text-[10px] text-slate-400 mt-2 mb-6 text-center">
            Nota: Para o Google Auth funcionar, é necessário configurar as credenciais do Google Cloud no painel do Supabase (Authentication &gt; Providers).
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-400 font-semibold uppercase">ou com e-mail</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/15"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  {isLoginView ? 'Entrar' : 'Criar Conta'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLoginView(!isLoginView); setAuthError(null); }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, we render the children and pass user context optionally.
  // The rest of the app can also get the user from supabaseAuthService.
  return <>{children}</>;
}
