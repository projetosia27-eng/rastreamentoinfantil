import React, { useState } from 'react';
import { UserCheck, Users, ShieldAlert, LogOut, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useSignal } from '../../../core/signals';
import { switchUserRole, familyPairingCodeSignal, familyParentEmailSignal, isDeviceLinkedSignal } from '../../../data/app-state-store';
import { supabaseAuthService } from '../../../services/supabaseAuthService';
import FamilyLinkingModal from './FamilyLinkingModal';

export default function ProfileSelection() {
  const familyCode = useSignal(familyPairingCodeSignal);
  const parentEmail = useSignal(familyParentEmailSignal);
  const isLinked = useSignal(isDeviceLinkedSignal);

  const [showLinkingModal, setShowLinkingModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-5 relative">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm" />
            <ShieldAlert className="h-10 w-10 relative z-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white text-center">
            Quem está usando?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-center text-sm sm:text-base">
            Selecione o seu perfil para acessar o Guardião Kids
          </p>

          {/* Family Link Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-bold shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Vínculo da Família: <span className="font-mono text-indigo-800 dark:text-indigo-200">{parentEmail}</span></span>
            <button
              onClick={() => setShowLinkingModal(true)}
              className="ml-2 px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-colors"
            >
              Código: {familyCode}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Parent Profile Card */}
          <button
            onClick={() => switchUserRole('parent')}
            className="group flex flex-col items-center p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-left"
          >
            <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">Painel dos Pais</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Monitore localização em tempo real, defina cercas geofence, gerencie missões e aprovação de prêmios.
            </p>
          </button>

          {/* Child Profile Card */}
          <button
            onClick={() => switchUserRole('child')}
            className="group flex flex-col items-center p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 text-left"
          >
            <div className="h-20 w-20 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-9 w-9 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">Espaço Kids</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Dispositivo do filho com GPS em tempo real, missões gamificadas, troca de moedas e botão SOS Pânico.
            </p>
          </button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setShowLinkingModal(true)}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-xs"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Configurar Vínculo com Celular do Pai / Código</span>
          </button>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <button
            onClick={() => supabaseAuthService.signOut()}
            className="flex items-center gap-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors font-semibold text-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da conta</span>
          </button>
        </div>

      </div>

      <FamilyLinkingModal
        isOpen={showLinkingModal}
        onClose={() => setShowLinkingModal(false)}
        userRole="parent"
      />
    </div>
  );
}
