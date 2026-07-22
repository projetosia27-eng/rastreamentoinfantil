import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Bluetooth, 
  Clock, 
  AlertTriangle,
  Hand,
  ShoppingBag,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2
} from 'lucide-react';
import { useSignal } from '../../../core/signals';
import { childrenSignal, updateProtectionMode, themeSignal, toggleTheme } from '../../../data/app-state-store';
import LooseHandModePanel from './LooseHandModePanel';
import ShoppingModePanel from './ShoppingModePanel';

interface ProtectionModuleProps {
  childId: string;
}

export default function ProtectionModule({ childId }: ProtectionModuleProps) {
  const children = useSignal(childrenSignal);
  const theme = useSignal(themeSignal);
  const child = children.find(c => c.id === childId);
  
  // Local state to simulate Bluetooth & GPS
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  if (!child) return null;

  const currentMode = child.protectionMode || 'standard';
  const isProtectionActive = currentMode !== 'none';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            Central de Proteção
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoramento em tempo real de {child.name}
          </p>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 active:scale-95 shadow-xs"
          title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="hidden sm:inline">Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className={`absolute inset-0 rounded-full blur-xl ${isProtectionActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`} />
            <div className={`h-20 w-20 rounded-full flex items-center justify-center relative z-10 shadow-lg ${isProtectionActive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-500/30'}`}>
              {isProtectionActive ? <ShieldCheck className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {isProtectionActive ? 'Proteção Ativada' : 'Proteção Desativada'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            O módulo de proteção está {isProtectionActive ? 'operando normalmente' : 'desativado no momento'}.
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => updateProtectionMode(child.id, 'standard')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${isProtectionActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Ativar
            </button>
            <button 
              onClick={() => updateProtectionMode(child.id, 'none' as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${!isProtectionActive ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/50' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Desativar
            </button>
          </div>
        </div>

        {/* Telemetry Sensors */}
        <div className="flex flex-col gap-3">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${gpsEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Sinal GPS</h4>
                <p className="text-[11px] text-slate-500 font-medium">{gpsEnabled ? 'Alta Precisão (Satélite)' : 'Sinal Perdido'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={gpsEnabled} onChange={() => setGpsEnabled(!gpsEnabled)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bluetoothEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                <Bluetooth className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Bluetooth</h4>
                <p className="text-[11px] text-slate-500 font-medium">{bluetoothEnabled ? 'Conectado aos sensores' : 'Desconectado'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={bluetoothEnabled} onChange={() => setBluetoothEnabled(!bluetoothEnabled)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Última Atualização</h4>
                <p className="text-[11px] text-slate-500 font-medium">Sincronizado {child.lastSeen}</p>
              </div>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              ATUALIZAR
            </button>
          </div>

        </div>
      </div>

      {/* SECTION: SERVIÇOS EXTRAS & MODOS DE PROTEÇÃO */}
      <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Ativação de Serviços Extras & Modos de Proteção
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Selecione para ativar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Card Modo Mão Solta */}
          <div 
            onClick={() => updateProtectionMode(child.id, 'loose_hand')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
              currentMode === 'loose_hand'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${
                  currentMode === 'loose_hand' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Hand className="h-5 w-5" />
                </div>
                {currentMode === 'loose_hand' && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-200 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Ativo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                Modo Mão Solta
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                Dispara alarme no seu celular caso a criança se afaste a partir de <span className="font-bold text-emerald-600 dark:text-emerald-400">2 metros</span>.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProtectionMode(child.id, 'loose_hand');
              }}
              className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                currentMode === 'loose_hand'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
              }`}
            >
              {currentMode === 'loose_hand' ? 'Modo Ativo (Ver Painel)' : 'Ativar Modo Mão Solta'}
            </button>
          </div>

          {/* Card Modo Shopping */}
          <div 
            onClick={() => updateProtectionMode(child.id, 'shopping')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
              currentMode === 'shopping'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${
                  currentMode === 'shopping' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                }`}>
                  <ShoppingBag className="h-5 w-5" />
                </div>
                {currentMode === 'shopping' && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Ativo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                Modo Shopping
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                Proteção reforçada para locais movimentados, praças de alimentação e eventos.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProtectionMode(child.id, 'shopping');
              }}
              className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                currentMode === 'shopping'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              {currentMode === 'shopping' ? 'Modo Ativo (Ver Painel)' : 'Ativar Modo Shopping'}
            </button>
          </div>

          {/* Card Modo Padrão */}
          <div 
            onClick={() => updateProtectionMode(child.id, 'standard')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
              currentMode === 'standard'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${
                  currentMode === 'standard' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                {currentMode === 'standard' && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-200 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Ativo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                Modo Padrão (GPS)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                Rastreamento constante por cerca virtual e monitoramento das zonas seguras.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateProtectionMode(child.id, 'standard');
              }}
              className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                currentMode === 'standard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
              }`}
            >
              {currentMode === 'standard' ? 'Modo Ativo' : 'Ativar Modo Padrão'}
            </button>
          </div>

        </div>
      </div>
      
      {/* Active Service Panel */}
      {currentMode === 'loose_hand' && (
        <LooseHandModePanel child={child} />
      )}
      
      {currentMode === 'shopping' && (
        <ShoppingModePanel child={child} />
      )}
      
      {/* Footer warning if something is disabled */}
      {(!gpsEnabled || !bluetoothEnabled) && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Atenção: A precisão da localização e das áreas seguras pode ser reduzida com sensores desativados.
          </p>
        </div>
      )}

    </div>
  );
}
