import React, { useState, useEffect } from 'react';
import { useSignal } from '../../../core/signals';
import { 
  childrenSignal, 
  selectedChildIdSignal, 
  familyPairingCodeSignal, 
  triggerSOS, 
  updateChildLocation,
  switchUserRole
} from '../../../data/app-state-store';
import { supabaseAuthService } from '../../../services/supabaseAuthService';
import { calculateChildLevel } from '../../../domain/use-cases';
import { useDeviceGPS, getAccuratePosition } from '../../../services/gpsService';
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
  ShieldCheck, 
  UserCheck,
  LogOut
} from 'lucide-react';

export default function ChildSpace() {
  const children = useSignal(childrenSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);
  const familyCode = useSignal(familyPairingCodeSignal);
  const { location, isLocating, errorMsg, refreshGPS } = useDeviceGPS();

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const [sosCooldown, setSosCooldown] = useState(false);

  // Sync real device GPS to selected child state when location updates
  useEffect(() => {
    if (selectedChild && location) {
      updateChildLocation(selectedChild.id, location.latitude, location.longitude, location.batteryLevel);
    }
  }, [selectedChild?.id, location?.latitude, location?.longitude, location?.batteryLevel]);

  const childLevelInfo = selectedChild ? calculateChildLevel(selectedChild.xp) : { level: 1, currentXp: 0, percentage: 0 };

  const handlePanicSOS = async () => {
    if (!selectedChild || sosCooldown) return;
    setSosCooldown(true);

    try {
      const pos = await getAccuratePosition();
      if (pos) {
        updateChildLocation(selectedChild.id, pos.latitude, pos.longitude, pos.batteryLevel);
      }
    } catch (e) {
      console.warn('GPS fetch before SOS alert:', e);
    }

    triggerSOS(selectedChild.id);
    setTimeout(() => setSosCooldown(false), 5000); // 5s debounce protection
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
        
        {/* ISOLATED DEVICE CHILD BADGE & PROFILE CONTROLS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
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
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            🔒 Dispositivo vinculado a este perfil.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => switchUserRole(null)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all"
              title="Trocar para o perfil dos Pais ou selecionar outro perfil"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Trocar Perfil</span>
            </button>

            <button
              onClick={async () => {
                switchUserRole(null);
                await supabaseAuthService.signOut();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
              title="Sair da conta e voltar ao login"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
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

          <button 
            onClick={() => switchUserRole(null)}
            className="flex flex-col items-center justify-center w-full py-2 gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600"
            title="Trocar Perfil"
          >
            <div className="px-4 py-1 rounded-full">
              <UserCheck className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-medium">
              Perfil
            </span>
          </button>

          <button 
            onClick={async () => {
              switchUserRole(null);
              await supabaseAuthService.signOut();
            }}
            className="flex flex-col items-center justify-center w-full py-2 gap-1 text-red-500 hover:text-red-600"
            title="Sair da Conta"
          >
            <div className="px-4 py-1 rounded-full">
              <LogOut className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-medium">
              Sair
            </span>
          </button>
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

    </div>
  );
}
