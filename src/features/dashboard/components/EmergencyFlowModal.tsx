import React from 'react';
import { Child } from '../../../domain/entities';
import { AlertTriangle, MapPin, Clock, ArrowRight, X } from 'lucide-react';
import { triggerEmergencyAlert } from '../../../services/onesignal';
import EmergencyAudioPlayer from '../../alerts/components/EmergencyAudioPlayer';

interface EmergencyFlowModalProps {
  child: Child;
  onClose: () => void;
  onOpenMap: () => void;
  onOpenPoster?: () => void;
}

export default function EmergencyFlowModal({ child, onClose, onOpenMap, onOpenPoster }: EmergencyFlowModalProps) {
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  React.useEffect(() => {
    triggerEmergencyAlert(child.name);
  }, [child.name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-red-100 dark:border-red-900/50 max-h-[90vh] overflow-y-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center border-b border-red-100 dark:border-red-900/50 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-red-700 dark:text-red-400 text-center">Emergência Acionada</h2>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 text-center mt-1">
            Alerta SOS de {child.name} registrado!
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* ITEM 5: SOS AUDIO MONITORING PLAYER */}
          <EmergencyAudioPlayer childName={child.name} timestamp={currentTime} />

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Hora do Acionamento</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">
                {currentTime} (Ativo)
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Última Localização (GPS)</p>
              <p className="text-sm font-black text-slate-800 dark:text-white truncate">
                {child.latitude.toFixed(5)}, {child.longitude.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => {
                onClose();
                onOpenMap();
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              Abrir Mapa de Rastreamento
              <ArrowRight className="h-5 w-5" />
            </button>

            {onOpenPoster && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPoster();
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
              >
                📢 Mandar pra Comunidade & Gerar Cartaz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
