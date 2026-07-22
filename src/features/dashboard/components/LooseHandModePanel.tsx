import React, { useState, useEffect } from 'react';
import { Child } from '../../../domain/entities';
import { Play, Square, Timer, MapPin, AlertTriangle, Hand, ShieldAlert, Volume2, Battery, BatteryCharging, Sliders } from 'lucide-react';
import { calculateDistance } from '../../../domain/use-cases';
import { useDeviceGPS } from '../../../services/gpsService';
import { triggerAlert, isPanicActiveSignal } from '../../../data/app-state-store';

interface LooseHandModePanelProps {
  child: Child;
}

export default function LooseHandModePanel({ child }: LooseHandModePanelProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [maxDistanceThreshold, setMaxDistanceThreshold] = useState<number>(10); // Default 10 meters
  const [simulatedOffsetMeters, setSimulatedOffsetMeters] = useState<number>(0);
  const [lastAlarmTime, setLastAlarmTime] = useState<number>(0);

  const { location: parentLocation } = useDeviceGPS();

  // Calculate real distance in meters between Parent's device and Child's device
  const calculateRealDistance = (): number => {
    if (!parentLocation || !child.latitude || !child.longitude) {
      return simulatedOffsetMeters;
    }
    const gpsDist = Math.round(
      calculateDistance(
        parentLocation.latitude,
        parentLocation.longitude,
        child.latitude,
        child.longitude
      )
    );
    return Math.max(0, gpsDist + simulatedOffsetMeters);
  };

  const currentDistance = calculateRealDistance();
  const isBreached = currentDistance > maxDistanceThreshold;

  // Timer and automatic breach monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Trigger alert sound if breached while active
  useEffect(() => {
    if (isActive && isBreached) {
      const now = Date.now();
      // Throttle alarm triggers to every 8 seconds
      if (now - lastAlarmTime > 8000) {
        setLastAlarmTime(now);
        triggerAlert({
          id: `alert-proximity-${now}`,
          childId: child.id,
          childName: child.name,
          type: 'geofence_exit',
          message: `🚨 ALARME PROXIMIDADE: ${child.name} se distanciou ${currentDistance}m do seu celular! (Limite máximo: ${maxDistanceThreshold}m)`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          latitude: child.latitude,
          longitude: child.longitude,
        });
      }
    }
  }, [isActive, isBreached, currentDistance, maxDistanceThreshold, child, lastAlarmTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setSimulatedOffsetMeters(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setSimulatedOffsetMeters(0);
  };

  const handleManualTriggerSiren = () => {
    triggerAlert({
      id: `alert-manual-${Date.now()}`,
      childId: child.id,
      childName: child.name,
      type: 'panic',
      message: `🚨 SIRENE MANUAL: Alerta de distanciamento ativado para ${child.name}!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    });
  };

  return (
    <div className={`border rounded-2xl p-5 mt-6 shadow-sm relative overflow-hidden transition-all ${
      isActive && isBreached
        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 animate-pulse'
        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
    }`}>
      <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
        <Hand className="h-28 w-28 text-emerald-600 dark:text-emerald-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl text-white ${
              isActive && isBreached ? 'bg-red-600 shadow-lg shadow-red-500/30' : 'bg-emerald-600 dark:bg-emerald-500 shadow-md'
            }`}>
              {isActive && isBreached ? <ShieldAlert className="h-5 w-5 animate-bounce" /> : <Hand className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Modo Mão Solta
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Perímetro {maxDistanceThreshold}m
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sinaliza se a criança se afastar do celular dos pais
              </p>
            </div>
          </div>

          {/* Child battery indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
            <Battery className="h-4 w-4 text-emerald-500" />
            <span>{child.batteryLevel}%</span>
          </div>
        </div>

        {/* Distance threshold slider controls */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-500" />
              Limite do Alarme de Distanciamento:
            </span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
              {maxDistanceThreshold} metros
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[2, 5, 10, 15, 20, 30].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMaxDistanceThreshold(val)}
                className={`flex-1 min-w-[36px] py-1 text-xs font-bold rounded-lg border transition-all ${
                  maxDistanceThreshold === val
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {val}m
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tempo Ativo</span>
              <Timer className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
              {formatTime(timeElapsed)}
            </div>
          </div>
          
          <div className={`bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border transition-colors ${
            isBreached ? 'border-red-400 bg-red-100/50 dark:bg-red-950/60' : 'border-emerald-100 dark:border-emerald-800/30'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Distância Real</span>
              <MapPin className={`h-4 w-4 ${isBreached ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
            </div>
            <div className={`text-2xl font-black tabular-nums tracking-tight flex items-baseline gap-1 ${
              isBreached ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'
            }`}>
              {currentDistance} <span className="text-xs font-bold text-slate-400">metros</span>
            </div>
          </div>
        </div>

        {/* Breach Alert Banner */}
        {isActive && isBreached && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-xl shadow-lg flex items-center justify-between gap-2 animate-bounce">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Criança fora do limite de {maxDistanceThreshold}m!</p>
                <p className="text-[11px] font-medium opacity-90">Distância atual: {currentDistance}m. Sirene acionada!</p>
              </div>
            </div>
            <Volume2 className="h-5 w-5 animate-pulse" />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          {!isActive ? (
            <button 
              onClick={handleStart}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" />
              Ativar Monitoramento {maxDistanceThreshold}m
            </button>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => setSimulatedOffsetMeters(prev => prev === 0 ? maxDistanceThreshold + 5 : 0)}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  simulatedOffsetMeters > 0
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title="Simular afastamento de 15 metros para testar alarme"
              >
                <AlertTriangle className="h-4 w-4" />
                {simulatedOffsetMeters > 0 ? 'Resetar Distância' : 'Simular +15m'}
              </button>

              <button 
                onClick={handleManualTriggerSiren}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                Soar Sirene
              </button>

              <button 
                onClick={handleStop}
                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Square className="h-4 w-4 fill-current" />
                Desativar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
