import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldAlert } from 'lucide-react';
import { useSignal } from '../../../core/signals';
import { parentPinSignal, familyPairingCodeSignal } from '../../../data/app-state-store';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function ParentPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'PIN de Segurança dos Pais',
  description = 'Digite o PIN de Segurança dos Pais ou Código de Pareamento para autorizar a alteração de perfil.'
}: ParentPinModalProps) {
  const parentPin = useSignal(parentPinSignal);
  const familyCode = useSignal(familyPairingCodeSignal);

  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === parentPin || inputPin.trim() === familyCode) {
      setInputPin('');
      setPinError('');
      onSuccess();
      onClose();
    } else {
      setPinError('PIN incorreto. Use a senha dos pais (padrão 1234) ou o código de pareamento.');
    }
  };

  const handleClose = () => {
    setInputPin('');
    setPinError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Proteção do Painel dos Pais
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              PIN de Segurança ou Código
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value);
                  setPinError('');
                }}
                placeholder="Ex: 1234 ou GK-8492"
                autoFocus
                className="w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold tracking-widest text-slate-800 dark:text-slate-100"
              />
            </div>
            {pinError && (
              <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>{pinError}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
