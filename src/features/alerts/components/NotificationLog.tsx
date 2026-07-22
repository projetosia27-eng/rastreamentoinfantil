import React from 'react';
import { useSignal } from '../../../core/signals';
import { alertsSignal, deleteAlert, markAlertsAsRead } from '../../../data/app-state-store';
import { Trash2, ShieldAlert, CheckCheck, BatteryWarning, Info, BellRing } from 'lucide-react';

export default function NotificationLog() {
  const alerts = useSignal(alertsSignal);
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-in fade-in duration-300" id="notification-log-panel">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="h-5 w-5 text-indigo-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mural de Notificações</h3>
            <p className="text-[11px] text-slate-500">Histórico de cercas virtuais, pânico e bateria</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAlertsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Lidas
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-2xl mb-2">🔔</p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tudo limpo por aqui!</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] mt-1 leading-relaxed">
            Nenhuma nova atividade registrada nas cercas virtuais dos seus filhos.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            let icon = <Info className="h-4 w-4 text-slate-500" />;
            let borderStyle = 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40';

            if (alert.type === 'panic') {
              icon = <ShieldAlert className="h-5 w-5 text-red-500" />;
              borderStyle = 'border-red-200 dark:border-red-950/50 bg-red-50 dark:bg-red-950/20';
            } else if (alert.type === 'battery_low') {
              icon = <BatteryWarning className="h-5 w-5 text-amber-500" />;
              borderStyle = 'border-amber-200 dark:border-amber-950/50 bg-amber-50 dark:bg-amber-950/20';
            } else if (alert.type === 'geofence_exit') {
              icon = <ShieldAlert className="h-5 w-5 text-rose-500" />;
              borderStyle = 'border-rose-100 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10';
            } else if (alert.type === 'geofence_enter') {
              icon = <CheckCheck className="h-5 w-5 text-emerald-500" />;
              borderStyle = 'border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/50 dark:bg-emerald-950/10';
            }

            return (
              <div
                key={alert.id}
                className={`flex gap-3 items-start p-3 rounded-xl border ${borderStyle} transition-all duration-300 hover:scale-[1.01] ${!alert.isRead ? 'ring-1 ring-indigo-500/35 dark:ring-indigo-400/35' : ''}`}
              >
                <div className="pt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed ${!alert.isRead ? 'font-bold' : 'font-normal'}`}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span>{alert.childName}</span>
                    <span>•</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
