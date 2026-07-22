import React, { useState } from 'react';
import { Child } from '../../../domain/entities';
import { ShoppingBag, Bluetooth, MapPin, Zap, Volume2, ShieldAlert } from 'lucide-react';

interface ShoppingModePanelProps {
  child: Child;
}

export default function ShoppingModePanel({ child }: ShoppingModePanelProps) {
  const [isAlertActive, setIsAlertActive] = useState(false);

  const handleQuickAlert = () => {
    setIsAlertActive(true);
    alert("Alerta rápido acionado! Notificação de volume máximo enviada.");
    setTimeout(() => setIsAlertActive(false), 3000);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 mt-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <ShoppingBag className="h-24 w-24 text-amber-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-amber-800 dark:text-amber-100">Modo Shopping</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Proteção em ambientes lotados</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <Bluetooth className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Bluetooth</p>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none">Intenso</p>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sinal GPS</p>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none">Alta Precisão</p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-3 col-span-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Volume do Dispositivo</p>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none">Máximo (Bloqueado)</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleQuickAlert}
          className={`w-full py-4 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isAlertActive 
              ? 'bg-rose-500 text-white shadow-rose-500/20' 
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
          }`}
        >
          {isAlertActive ? (
            <>
              <ShieldAlert className="h-5 w-5 animate-bounce" />
              ALERTA ENVIADO!
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 fill-current" />
              ALERTA RÁPIDO
            </>
          )}
        </button>
      </div>
    </div>
  );
}
