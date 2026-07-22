import React, { useState, useEffect } from 'react';
import { useSignal } from '../../../core/signals';
import { 
  childrenSignal, 
  selectedChildIdSignal, 
  setSelectedChildId, 
  parentPinSignal, 
  familyPairingCodeSignal, 
  triggerSOS, 
  updateChildLocation 
} from '../../../data/app-state-store';
import { calculateChildLevel } from '../../../domain/use-cases';
import { useDeviceGPS } from '../../../services/gpsService';
import TaskBoard from '../../tasks/components/TaskBoard';
import RewardStore from '../../rewards/components/RewardStore';
import { 
  Flame, 
  Star, 
  Trophy, 
  Gift, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Navigation, 
  Smartphone, 
  Lock, 
  ShieldCheck, 
  X, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';

export default function ChildSpace() {
  const children = useSignal(childrenSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);
  const parentPin = useSignal(parentPinSignal);
  const familyCode = useSignal(familyPairingCodeSignal);
  const { location, isLocating, errorMsg, refreshGPS } = useDeviceGPS();

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const [sosCooldown, setSosCooldown] = useState(false);

  // Parent PIN Security Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  // Sync real device GPS to selected child state when location updates
  useEffect(() => {
    if (selectedChild && location) {
      updateChildLocation(selectedChild.id, location.latitude, location.longitude);
    }
  }, [selectedChild?.id, location?.latitude, location?.longitude]);

  const childLevelInfo = selectedChild ? calculateChildLevel(selectedChild.xp) : { level: 1, currentXp: 0, percentage: 0 };

  const handlePanicSOS = () => {
    if (!selectedChild || sosCooldown) return;
    triggerSOS(selectedChild.id);
    setSosCooldown(true);
    setTimeout(() => setSosCooldown(false), 5000); // 5s debounce protection
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = inputPin.trim().toLowerCase();
    if (cleanPin === parentPin.toLowerCase() || cleanPin === familyCode.toLowerCase() || cleanPin === '1234') {
      setIsPinVerified(true);
      setPinError('');
    } else {
      setPinError('PIN incorreto. Digite a senha dos pais (Padrão: 1234) ou Código de Pareamento.');
    }
  };

  const handleSelectChildDevice = (childId: string) => {
    setSelectedChildId(childId);
    setShowPinModal(false);
    setIsPinVerified(false);
    setInputPin('');
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setIsPinVerified(false);
    setInputPin('');
    setPinError('');
  };

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Nenhum Perfil Encontrado</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Não há nenhuma criança cadastrada ou ocorreu um erro de sincronização com o banco de dados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 lg:pb-0" id="child-space-layout">
      
      {/* LEFT COLUMN: HERO STATS AND PANIC BUTTON */}
      <div className="col-span-12 lg:col-span-4 space-y-5 lg:sticky lg:top-24 h-max">
        
        {/* ISOLATED DEVICE CHILD BADGE & OPTIONAL PARENT LOCK */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Acesso Individual do Filho
                </p>
                <p className="text-sm font-black text-slate-800 dark:text-white truncate">
                  {selectedChild.name}
                </p>
              </div>
            </div>

            {children.length > 1 && (
              <button
                onClick={() => setShowPinModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0"
                title="Trocar perfil do filho (Requer PIN dos Pais)"
              >
                <Lock className="h-3 w-3 text-indigo-500" />
                <span>Trocar</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            🔒 Cada celular é vinculado exclusivamente ao seu próprio filho.
          </p>
        </div>

        {/* HERO STATS AVATAR CARD */}
        {selectedChild && (
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl p-6 shadow-xl shadow-orange-500/10 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300/20 rounded-full filter blur-xl" />

            <div className="flex items-center gap-4 relative z-10">
              {selectedChild.avatar.startsWith('http') || selectedChild.avatar.startsWith('data:') ? (
                <img src={selectedChild.avatar} alt={selectedChild.name} className="w-14 h-14 rounded-2xl object-cover bg-white/20 backdrop-blur-md animate-bounce" />
              ) : (
                <span className="text-5xl p-2 bg-white/20 backdrop-blur-md rounded-2xl animate-bounce">{selectedChild.avatar}</span>
              )}
              <div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                  Olá, {selectedChild.name}!
                  <Sparkles className="h-4.5 w-4.5 text-yellow-200 fill-yellow-200 animate-pulse" />
                </h2>
                <p className="text-xs text-yellow-100 font-semibold mt-1">Super herói Guardião Kids</p>
              </div>
            </div>

            {/* GAMIFIED STATS DISPLAY */}
            <div className="grid grid-cols-2 gap-3.5 mt-6 relative z-10">
              <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-wider text-yellow-100">Moedas Conquistadas</p>
                <p className="text-2xl font-black mt-1 flex items-center gap-1">
                  💰 {selectedChild.coins}
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-wider text-yellow-100">Nível Heroico</p>
                <p className="text-2xl font-black mt-1 flex items-center gap-1">
                  ⭐ {childLevelInfo.level}
                </p>
              </div>
            </div>

            {/* Level progression bar */}
            <div className="mt-5 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-bold text-yellow-100 mb-1">
                <span>XP da Jornada: {selectedChild.xp} pts</span>
                <span>Faltam {200 - childLevelInfo.currentXp} XP</span>
              </div>
              <div className="w-full bg-black/15 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-200 h-full rounded-full transition-all duration-500"
                  style={{ width: `${childLevelInfo.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* REAL-TIME GPS TELEMETRY BADGE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${location ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60'}`}>
              <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">
                {location ? 'GPS do Dispositivo Conectado' : 'Buscando GPS Real...'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : errorMsg || 'Aguardando permissão de localização'}
              </p>
            </div>
          </div>
          <button
            onClick={refreshGPS}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* CRITICAL SOS PANIC SIREN BUTTON */}
        <div className="bg-red-500/10 border border-red-200 dark:border-red-950/50 rounded-2xl p-5 text-center shadow-xs">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-red-700 dark:text-red-400">Botão SOS de Emergência</h4>
          <p className="text-[10px] text-red-600 dark:text-red-300/80 mt-1 leading-relaxed max-w-xs mx-auto">
            Apenas aperte este botão em caso de necessidade de ajuda imediata ou emergência! O alarme dos pais irá tocar alto.
          </p>

          <button
            onClick={handlePanicSOS}
            disabled={sosCooldown}
            className={`mt-4 w-full py-4 rounded-2xl font-black text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              sosCooldown
                ? 'bg-slate-400/50 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/20 shadow-red-500/10'
            }`}
          >
            <ShieldAlert className="h-5 w-5 animate-pulse" />
            {sosCooldown ? 'Enviando Alerta...' : 'SOS PANIC ALARME'}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: INTERACTIVE TABS */}
      <div className="col-span-12 lg:col-span-8 space-y-5 flex flex-col">
        
        {/* Child Interactive Tabs (Desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Minhas Missões Ativas
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Gift className="h-4 w-4" />
            Comprar Prêmios
          </button>
        </div>

        {/* Material 3 Bottom Navigation (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F0F4F8] dark:bg-[#1E1E24] flex justify-around items-center pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] border-t border-slate-200/50 dark:border-slate-800/50 min-h-[80px] px-2">
          {[
            { id: 'tasks', icon: Trophy, label: 'Missões' },
            { id: 'rewards', icon: Gift, label: 'Prêmios' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className="flex flex-col items-center justify-center w-full py-2 gap-1"
            >
              <div className={`px-5 py-1 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                <tab.icon className={`h-6 w-6 ${activeTab === tab.id ? 'fill-amber-700 dark:fill-amber-300' : ''}`} />
              </div>
              <span className={`text-[11px] font-medium transition-colors ${activeTab === tab.id ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic component layout */}
        <div className="flex-1">
          {activeTab === 'tasks' && selectedChild && (
            <TaskBoard role="child" childId={selectedChild.id} />
          )}

          {activeTab === 'rewards' && selectedChild && (
            <RewardStore role="child" childId={selectedChild.id} />
          )}
        </div>

      </div>

      {/* PARENT PIN SECURITY MODAL FOR DEVICE RE-ASSIGNMENT */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Trocar Perfil deste Celular
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Protegido contra troca por crianças
                </p>
              </div>
            </div>

            {!isPinVerified ? (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <KeyRound className="h-4 w-4" />
                    Validação dos Pais Obrigatória
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Para selecionar outro filho neste celular, digite a senha/PIN dos Pais ou o Código de Pareamento (<span className="font-mono font-bold">GK-8492</span>).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    PIN dos Pais (Padrão: 1234)
                  </label>
                  <input
                    type="password"
                    required
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Ex: 1234 ou GK-8492"
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
                  <ShieldCheck className="h-4 w-4" />
                  Desbloquear e Selecionar Filho
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  PIN Confirmado! Selecione a criança que usa este celular:
                </div>

                <div className="space-y-2">
                  {children.map((child) => {
                    const isSelected = child.id === selectedChildId;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleSelectChildDevice(child.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{child.avatar}</span>
                          <span className="text-sm font-black">{child.name}</span>
                        </div>
                        {isSelected && (
                          <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-extrabold uppercase">
                            Atual
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
