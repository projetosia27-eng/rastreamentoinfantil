import React, { useState } from 'react';
import { useSignal } from '../../../core/signals';
import { alertsSignal, deleteAlert, markAlertsAsRead, childrenSignal } from '../../../data/app-state-store';
import { 
  Trash2, 
  ShieldAlert, 
  CheckCheck, 
  BatteryWarning, 
  Info, 
  BellRing, 
  FileText, 
  Share2, 
  Filter, 
  ShieldCheck, 
  Mic, 
  Sparkles 
} from 'lucide-react';
import EmergencyAudioPlayer from './EmergencyAudioPlayer';

export default function NotificationLog() {
  const alerts = useSignal(alertsSignal);
  const children = useSignal(childrenSignal);
  
  const [filterType, setFilterType] = useState<'all' | 'panic' | 'geofence' | 'battery'>('all');
  const [showReport, setShowReport] = useState(true);

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const panicCount = alerts.filter(a => a.type === 'panic').length;
  const geofenceCount = alerts.filter(a => a.type === 'geofence_exit' || a.type === 'geofence_enter').length;
  const batteryCount = alerts.filter(a => a.type === 'battery_low').length;

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'panic') return alert.type === 'panic';
    if (filterType === 'geofence') return alert.type === 'geofence_exit' || alert.type === 'geofence_enter';
    if (filterType === 'battery') return alert.type === 'battery_low';
    return true;
  });

  const handleExportDailyReport = () => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const childNames = children.map(c => c.name).join(', ') || 'Filhos';
    
    const text = encodeURIComponent(
      `🛡️ *GUARDIÃO KIDS - RELATÓRIO DIÁRIO DE SEGURANÇA*\n` +
      `📅 *Data:* ${todayStr}\n` +
      `👧 *Monitorado(s):* ${childNames}\n\n` +
      `📊 *Resumo Geral:*\n` +
      `• Status: ${panicCount > 0 ? '🔴 Atenção - Alerta Registrado' : '🟢 100% Protegido e Seguro'}\n` +
      `• Total de Notificações Hoje: ${alerts.length}\n` +
      `• Eventos de Cerca Virtual: ${geofenceCount}\n` +
      `• Alertas de Pânico/SOS: ${panicCount}\n` +
      `• Avisos de Bateria Fraca: ${batteryCount}\n\n` +
      `Guardião Kids — Cuidado e Proteção em Tempo Real.`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs animate-in fade-in duration-300 space-y-5" id="notification-log-panel">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <BellRing className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Histórico & Relatórios de Segurança
            </h3>
            <p className="text-xs text-slate-500">Mural unificado de cercas virtuais, áudios de pânico e bateria</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAlertsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all border border-indigo-200/50 dark:border-indigo-900/50"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Lidas</span>
          </button>
        )}
      </div>

      {/* ITEM 4: RELATÓRIO DIÁRIO DE SEGURANÇA SUMMARY CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 rounded-2xl border border-indigo-700/40 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 text-cyan-400 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
              Relatório Diário de Segurança
            </h4>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
            panicCount > 0
              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            <ShieldCheck className="h-3 w-3" />
            {panicCount > 0 ? 'Alerta Ativo Hoje' : '100% Protegido Hoje'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3.5 text-center">
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="block text-base font-black text-white">{alerts.length}</span>
            <span className="text-[10px] text-slate-300 font-medium">Eventos Hoje</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="block text-base font-black text-rose-400">{panicCount}</span>
            <span className="text-[10px] text-slate-300 font-medium">SOS Pânico</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="block text-base font-black text-emerald-400">{geofenceCount}</span>
            <span className="text-[10px] text-slate-300 font-medium">Cercas Virtuais</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportDailyReport}
          className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Exportar Relatório Completo no WhatsApp</span>
        </button>
      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos ({alerts.length})
        </button>

        <button
          onClick={() => setFilterType('panic')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 flex items-center gap-1 ${
            filterType === 'panic'
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          🚨 Pânico SOS ({panicCount})
        </button>

        <button
          onClick={() => setFilterType('geofence')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 flex items-center gap-1 ${
            filterType === 'geofence'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          🛡️ Cercas ({geofenceCount})
        </button>

        <button
          onClick={() => setFilterType('battery')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 flex items-center gap-1 ${
            filterType === 'battery'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          🔋 Bateria ({batteryCount})
        </button>
      </div>

      {/* NOTIFICATIONS FEED */}
      {filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-2xl mb-2">🔔</p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Nenhum evento nesta categoria!</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] mt-1 leading-relaxed">
            Sua lista de alertas está totalmente atualizada e limpa.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredAlerts.map((alert) => {
            let icon = <Info className="h-4 w-4 text-slate-500" />;
            let borderStyle = 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40';

            if (alert.type === 'panic') {
              icon = <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />;
              borderStyle = 'border-red-200 dark:border-red-950/50 bg-red-50/80 dark:bg-red-950/20';
            } else if (alert.type === 'battery_low') {
              icon = <BatteryWarning className="h-5 w-5 text-amber-500 shrink-0" />;
              borderStyle = 'border-amber-200 dark:border-amber-950/50 bg-amber-50/80 dark:bg-amber-950/20';
            } else if (alert.type === 'geofence_exit') {
              icon = <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />;
              borderStyle = 'border-rose-100 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10';
            } else if (alert.type === 'geofence_enter') {
              icon = <CheckCheck className="h-5 w-5 text-emerald-500 shrink-0" />;
              borderStyle = 'border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/50 dark:bg-emerald-950/10';
            }

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border ${borderStyle} transition-all duration-300 hover:scale-[1.01] space-y-3 ${
                  !alert.isRead ? 'ring-1 ring-indigo-500/35 dark:ring-indigo-400/35' : ''
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="pt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed ${!alert.isRead ? 'font-bold' : 'font-normal'}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="font-bold text-slate-600 dark:text-slate-300">{alert.childName}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-xs"
                    title="Excluir notificação"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* ITEM 5: EMBEDDED EMERGENCY AUDIO PLAYER FOR PANIC ALERTS */}
                {(alert.type === 'panic' || alert.hasAudio) && (
                  <EmergencyAudioPlayer childName={alert.childName} timestamp={alert.timestamp} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
