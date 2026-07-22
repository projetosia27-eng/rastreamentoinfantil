import React, { useEffect, useState } from 'react';
import { initOneSignal } from './services/onesignal';
import { useSignal } from './core/signals';
import {
  themeSignal,
  userRoleSignal,
  toggleTheme,
  switchUserRole,
  isPanicActiveSignal,
  clearSOS,
  syncErrorSignal,
  activeTabSignal,
  isDeviceLinkedSignal
} from './data/app-state-store';
import ParentDashboard from './features/dashboard/components/ParentDashboard';
import ChildSpace from './features/dashboard/components/ChildSpace';
import ProfileSelection from './features/dashboard/components/ProfileSelection';
import FamilyLinkingModal from './features/dashboard/components/FamilyLinkingModal';
import ParentPinModal from './features/dashboard/components/ParentPinModal';
import { 
  ShieldAlert, 
  Sun, 
  Moon, 
  Users, 
  UserCheck, 
  HeartHandshake, 
  LogOut, 
  Link as LinkIcon, 
  LayoutDashboard, 
  Compass, 
  Trophy, 
  Shield, 
  Gift 
} from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import { supabaseAuthService } from './services/supabaseAuthService';

export default function App() {
  useEffect(() => {
    initOneSignal();
  }, []);

  const theme = useSignal(themeSignal);
  const role = useSignal(userRoleSignal);
  const isPanicActive = useSignal(isPanicActiveSignal);
  const syncError = useSignal(syncErrorSignal);
  const currentTab = useSignal(activeTabSignal);
  const isLinked = useSignal(isDeviceLinkedSignal);

  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [showParentPinModal, setShowParentPinModal] = useState(false);
  const [pendingParentAction, setPendingParentAction] = useState<(() => void) | null>(null);

  const handleSwitchProfile = () => {
    if (role === 'parent') {
      setPendingParentAction(() => () => switchUserRole(null));
      setShowParentPinModal(true);
    } else {
      switchUserRole(null);
    }
  };

  const handleLogout = () => {
    if (role === 'parent') {
      setPendingParentAction(() => async () => {
        switchUserRole(null);
        await supabaseAuthService.signOut();
      });
      setShowParentPinModal(true);
    } else {
      switchUserRole(null);
      supabaseAuthService.signOut();
    }
  };

  useEffect(() => {
    if (role === 'child' && !isLinked) {
      setShowLinkingModal(true);
    }
  }, [role, isLinked]);

  if (role === null) {
    return (
      <AuthGuard>
        {syncError && (
          <div className="bg-red-500 text-white text-xs py-2 px-4 text-center font-medium">
            {syncError}
          </div>
        )}
        <ProfileSelection />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#121212] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 pb-20 sm:pb-24">
        
        {syncError && (
          <div className="bg-red-500 text-white text-xs py-2 px-4 text-center font-medium">
            {syncError}
          </div>
        )}

        {/* Material 3 Top App Bar */}
        <header className="sticky top-0 z-40 bg-[#F0F4F8]/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={handleSwitchProfile}
                className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 relative hover:scale-105 transition-transform shrink-0"
                title="Trocar perfil"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm" />
                <ShieldAlert className="h-5 w-5 relative z-10" />
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Guardião Kids
                </h1>
                <p className="text-[10px] sm:text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Cuidado e Segurança em Tempo Real
                </p>
              </div>
            </div>

            {/* Quick Actions & Pairing Code Trigger */}
            <div className="flex items-center gap-2">
              
              {/* Family Linking Code Button */}
              <button
                onClick={() => setShowLinkingModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                title="Ver Código de Pareamento de Vínculo"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {role === 'parent' ? 'Código de Pareamento' : 'Vínculo do Filho'}
                </span>
              </button>

              {/* Role Toggle Switcher */}
              <button
                onClick={handleSwitchProfile}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Trocar de perfil (Requer senha para acessar como Pai)"
              >
                {role === 'parent' ? (
                  <>
                    <span className="hidden sm:inline">Perfil:</span>
                    <span className="text-indigo-600 dark:text-indigo-300">👨‍👩‍👧 Pai</span>
                    <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-extrabold ml-1">Trocar</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Perfil:</span>
                    <span className="text-indigo-600 dark:text-indigo-300">👦 Filho</span>
                    <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-extrabold ml-1">Trocar</span>
                  </>
                )}
              </button>

              {/* Light / Dark Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 cursor-pointer transition-colors"
                title="Sair"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>

            </div>
          </div>
        </header>

        {/* Global Urgent Emergency Alert Bar */}
        {isPanicActive && role === 'child' && (
          <div className="bg-red-500 text-white font-bold text-xs py-2 px-4 text-center animate-pulse flex items-center justify-center gap-2">
            <span>🚨 SOS ATIVO NO DISPOSITIVO. Mantenha a calma! Seus pais já estão sendo avisados.</span>
            <button
              onClick={clearSOS}
              className="underline ml-2 hover:text-red-100 font-extrabold"
            >
              Encerrar SOS
            </button>
          </div>
        )}

        {/* Main Screen Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {role === 'parent' ? (
            <ParentDashboard />
          ) : (
            <ChildSpace />
          )}
        </main>

        {/* UNIVERSAL PERSISTENT FOOTER NAVIGATION BAR */}
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl shadow-indigo-950/20 flex items-center justify-around">
          {role === 'parent' ? (
            <>
              <button
                onClick={() => activeTabSignal.set('dashboard')}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Início</span>
              </button>

              <button
                onClick={() => activeTabSignal.set('map')}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  currentTab === 'map'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Compass className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Mapa</span>
              </button>

              <button
                onClick={() => activeTabSignal.set('tasks')}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  currentTab === 'tasks'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Trophy className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Missões</span>
              </button>

              <button
                onClick={() => activeTabSignal.set('protection')}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  currentTab === 'protection'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Shield className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Proteção</span>
              </button>

              <button
                onClick={() => activeTabSignal.set('community')}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  currentTab === 'community'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Users className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Rede</span>
              </button>

              <button
                onClick={() => setShowLinkingModal(true)}
                className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
                title="Ver Código de Pareamento"
              >
                <LinkIcon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-bold mt-0.5">Código</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => activeTabSignal.set('tasks')}
                className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all ${
                  currentTab === 'tasks'
                    ? 'bg-amber-500 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                <Trophy className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Missões</span>
              </button>

              <button
                onClick={() => activeTabSignal.set('rewards')}
                className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all ${
                  currentTab === 'rewards'
                    ? 'bg-amber-500 text-white font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                <Gift className="h-4.5 w-4.5" />
                <span className="text-[10px] mt-0.5">Prêmios</span>
              </button>

              <button
                onClick={() => setShowLinkingModal(true)}
                className="flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
              >
                <LinkIcon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-bold mt-0.5">Vincular</span>
              </button>

              <button
                onClick={handleSwitchProfile}
                className="flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-all"
              >
                <UserCheck className="h-4.5 w-4.5" />
                <span className="text-[10px] font-medium mt-0.5">Perfil</span>
              </button>
            </>
          )}
        </nav>

        {/* Family Pairing & Device Linking Modal */}
        <FamilyLinkingModal
          isOpen={showLinkingModal}
          onClose={() => setShowLinkingModal(false)}
          userRole={role}
        />

        {/* Parent PIN Security Modal */}
        <ParentPinModal
          isOpen={showParentPinModal}
          onClose={() => {
            setShowParentPinModal(false);
            setPendingParentAction(null);
          }}
          onSuccess={() => {
            if (pendingParentAction) {
              pendingParentAction();
              setPendingParentAction(null);
            }
          }}
        />

        {/* Footer bar */}
        <footer className="hidden lg:block py-6 border-t border-slate-200/60 dark:border-slate-900 bg-[#F0F4F8] dark:bg-[#121212] text-center text-slate-400 dark:text-slate-500 text-xs mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium">
              🛡️ Guardião Kids © {new Date().getFullYear()} — Tecnologia em favor da segurança da sua família.
            </p>
            <p className="text-[10px] font-mono opacity-80 flex items-center gap-1">
              <HeartHandshake className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              Clean Architecture & Standalone Principles
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
