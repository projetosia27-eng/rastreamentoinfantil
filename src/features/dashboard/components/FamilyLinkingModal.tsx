import React, { useState } from 'react';
import { useSignal } from '../../../core/signals';
import {
  familyPairingCodeSignal,
  familyParentEmailSignal,
  familyParentPhoneSignal,
  isDeviceLinkedSignal,
  linkedParentEmailSignal,
  linkDeviceWithParent,
  unlinkDevice,
  childrenSignal
} from '../../../data/app-state-store';
import { X, Copy, Check, Share2, Link as LinkIcon, Smartphone, ShieldCheck, Mail, Phone, QrCode, AlertCircle, Unlink } from 'lucide-react';

interface FamilyLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'parent' | 'child';
}

export default function FamilyLinkingModal({ isOpen, onClose, userRole }: FamilyLinkingModalProps) {
  const familyCode = useSignal(familyPairingCodeSignal);
  const parentEmail = useSignal(familyParentEmailSignal);
  const parentPhone = useSignal(familyParentPhoneSignal);
  const isLinked = useSignal(isDeviceLinkedSignal);
  const linkedEmail = useSignal(linkedParentEmailSignal);
  const children = useSignal(childrenSignal);

  const [inputCodeOrEmail, setInputCodeOrEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛡️ *Guardião Kids* — Código de Pareamento Familiar\n\n` +
      `Para conectar o aplicativo ou relógio do seu filho ao painel dos pais, utilize:\n` +
      `• *Código de Pareamento:* ${familyCode}\n` +
      `• *E-mail dos Pais:* ${parentEmail}\n\n` +
      `Acesse no seu celular!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCodeOrEmail.trim()) return;

    const res = linkDeviceWithParent(inputCodeOrEmail);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setInputCodeOrEmail('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleUnlink = () => {
    unlinkDevice();
    setStatusMessage({ type: 'error', text: 'Dispositivo desvinculado dos pais.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <LinkIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {userRole === 'parent' ? 'Código de Pareamento Familiar' : 'Vínculo com a Conta dos Pais'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userRole === 'parent' 
                ? 'Conecte o aplicativo do seu filho ao seu e-mail e painel' 
                : 'Conecte este celular ao e-mail cadastrado do seu pai ou mãe'}
            </p>
          </div>
        </div>

        {/* PARENT VIEW: SHOW CODE & SHARE OPTIONS */}
        {userRole === 'parent' ? (
          <div className="space-y-5">
            
            {/* Display Family Code Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/50 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">
                Seu Código de Pareamento de 6 Dígitos
              </span>

              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-3xl font-mono font-black tracking-widest text-cyan-400">
                  {familyCode}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
                    title="Copiar código"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    title="Enviar pelo WhatsApp"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Parent Account Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Credenciais de Vínculo Familiar
              </h4>

              <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">E-mail Cadastrado dos Pais</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{parentEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Celular dos Pais</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{parentPhone}</p>
                </div>
              </div>
            </div>

            {/* List of Monitored Devices */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Dispositivos e Perfis Ativos ({children.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {children.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.avatar}</span>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{c.name}</p>
                        <p className="text-[10px] text-slate-400">Status: Conectado via GPS</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-full">
                      Vinculado
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* CHILD VIEW: LINK FORM & STATUS */
          <div className="space-y-5">
            
            {/* Status Banner */}
            {isLinked ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm">Dispositivo Vinculado aos Pais!</p>
                  <p className="mt-1">
                    Este aplicativo está conectado à conta do seu pai/mãe: <span className="font-bold font-mono">{linkedEmail || parentEmail}</span>.
                  </p>
                  <button
                    onClick={handleUnlink}
                    className="mt-3 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Desvincular este dispositivo
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Dispositivo sem Vínculo</p>
                  <p className="mt-1">
                    Digite o e-mail cadastrado dos seus pais ou o código de 6 dígitos para sincronizar suas missões, localização e o botão SOS.
                  </p>
                </div>
              </div>
            )}

            {/* Linking Form */}
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail do Pai / Mãe ou Código de Pareamento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={inputCodeOrEmail}
                    onChange={(e) => setInputCodeOrEmail(e.target.value)}
                    placeholder="Ex: projetosia27@gmail.com ou GK-8492"
                    className="w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <LinkIcon className="h-4 w-4" />
                Vincular Dispositivo Agora
              </button>
            </form>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">💡 Onde encontrar o e-mail ou código?</p>
              <p>Solicite aos seus pais que abram o aplicativo deles no <span className="font-semibold">Painel dos Pais</span> e cliquem no botão <span className="font-semibold">"Código de Pareamento"</span>.</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
