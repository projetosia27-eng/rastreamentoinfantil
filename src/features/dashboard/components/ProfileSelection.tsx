import React, { useState } from 'react';
import { UserCheck, Users, ShieldAlert, LogOut, Link as LinkIcon, CheckCircle2, X, Lock } from 'lucide-react';
import { useSignal } from '../../../core/signals';
import { switchUserRole, familyPairingCodeSignal, familyParentPhoneSignal, isDeviceLinkedSignal, parentPinSignal } from '../../../data/app-state-store';
import { supabaseAuthService } from '../../../services/supabaseAuthService';
import FamilyLinkingModal from './FamilyLinkingModal';

export default function ProfileSelection() {
  const familyCode = useSignal(familyPairingCodeSignal);
  const parentPhone = useSignal(familyParentPhoneSignal);
  const isLinked = useSignal(isDeviceLinkedSignal);
  const parentPin = useSignal(parentPinSignal);

  const [showLinkingModal, setShowLinkingModal] = useState(false);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleParentClick = () => {
    setShowPinModal(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === parentPin || inputPin === familyCode) {
      switchUserRole('parent');
    } else {
      setPinError('PIN incorreto. Use o PIN dos pais ou o código de pareamento.');
    }
  };

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

          <div className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-center max-w-sm">
            💡 <strong>Aviso:</strong> Sua escolha será salva. Para trocar de perfil depois, clique no ícone do aplicativo no canto superior esquerdo do painel.
          </div>

          {/* Family Link Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-bold shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Vínculo da Família: <span className="font-mono text-indigo-800 dark:text-indigo-200">{parentPhone}</span></span>
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
            onClick={handleParentClick}
            className="group flex flex-col items-center p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-400">
              <Lock className="h-4 w-4" />
            </div>
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

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowPinModal(false);
                setInputPin('');
                setPinError('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Acesso Restrito
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Protegido contra o acesso de crianças
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  PIN dos Pais (Padrão: 1234)
                </label>
                <input
                  type="password"
                  required
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Ex: 1234 ou Código"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-800 dark:text-slate-200 text-center tracking-widest"
                />
              </div>

              {pinError && (
                <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
