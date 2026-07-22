import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, MapPin, Bluetooth, Clock, AlertTriangle } from 'lucide-react';
import { useSignal } from '../../../core/signals';
import { childrenSignal, updateProtectionMode } from '../../../data/app-state-store';
import LooseHandModePanel from './LooseHandModePanel';
import ShoppingModePanel from './ShoppingModePanel';

interface ProtectionModuleProps {
  childId: string;
}

export default function ProtectionModule({ childId }: ProtectionModuleProps) {
  const children = useSignal(childrenSignal);
  const child = children.find(c => c.id === childId);
  
  // Local state to simulate Bluetooth & GPS, since it's not in the main store right now.
  // In a real scenario, this would come from the child's device telemetry via Supabase.
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  if (!child) return null;

  const isProtectionActive = child.protectionMode === 'standard' || child.protectionMode === 'shopping' || child.protectionMode === 'loose_hand';
  // Let's assume 'standard' is active, and if we want to deactivate completely we might need a 'none' mode. 
  // Let's add 'none' to protection mode if deactivated? Wait, we can't easily change the entity type everywhere unless we want to. 
  // Wait, let's look at the entity type. It's 'standard' | 'shopping' | 'loose_hand'.
  // Actually, I can just use a local state for "Protection Active" or assume one of the modes is active. 
  // I will add a toggle for Master Protection switch.

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            Central de Proteção
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoramento em tempo real de {child.name}
          </p>
        </div>
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
      
      {child.protectionMode === 'loose_hand' && (
        <LooseHandModePanel child={child} />
      )}
      
      {child.protectionMode === 'shopping' && (
        <ShoppingModePanel child={child} />
      )}
      
      {/* Footer warning if something is disabled */}
      {(!gpsEnabled || !bluetoothEnabled) && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Atenção: A precisão da localização e das áreas seguras pode ser reduzida com sensores desativados.
          </p>
        </div>
      )}

    </div>
  );
}
