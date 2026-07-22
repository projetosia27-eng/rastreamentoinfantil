import React, { useState, useEffect } from 'react';
import { Child } from '../../../domain/entities';
import { Play, Square, Timer, MapPin, AlertCircle, Hand } from 'lucide-react';

interface LooseHandModePanelProps {
  child: Child;
}

export default function LooseHandModePanel({ child }: LooseHandModePanelProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [distance, setDistance] = useState(0); // in meters

  // Simulate timer and distance
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setDistance(prev => prev + Math.floor(Math.random() * 3)); // Simulate random movement
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => setIsActive(true);
  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setDistance(0);
  };
  const handleAlert = () => alert("Alerta acionado para a criança!");

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 mt-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Hand className="h-24 w-24 text-emerald-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Hand className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-100">Modo Mão Solta</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Monitoramento de proximidade ativa</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Cronômetro</span>
              <Timer className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
              {formatTime(timeElapsed)}
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Distância</span>
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight flex items-baseline gap-1">
              {distance} <span className="text-sm font-bold text-slate-400">m</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {!isActive ? (
            <button 
              onClick={handleStart}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" />
              Iniciar
            </button>
          ) : (
            <>
              <button 
                onClick={handleAlert}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <AlertCircle className="h-5 w-5" />
                Alerta
              </button>
              <button 
                onClick={handleStop}
                className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20 active:scale-95"
              >
                <Square className="h-5 w-5 fill-current" />
                Finalizar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
