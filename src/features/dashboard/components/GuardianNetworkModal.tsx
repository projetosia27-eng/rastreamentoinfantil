import React, { useState } from 'react';
import { useSignal } from '../../../core/signals';
import {
  secondaryGuardiansSignal,
  addSecondaryGuardian,
  deleteSecondaryGuardian,
  toggleGuardianSOS,
  childrenSignal,
  selectedChildIdSignal
} from '../../../data/app-state-store';
import { Users, Shield, Plus, Phone, MessageSquare, Trash2, X, CheckCheck, Share2, BellRing, HeartHandshake } from 'lucide-react';

interface GuardianNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuardianNetworkModal({ isOpen, onClose }: GuardianNetworkModalProps) {
  const guardians = useSignal(secondaryGuardiansSignal);
  const children = useSignal(childrenSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Mãe');
  const [role, setRole] = useState<'principal' | 'secundario' | 'emergencia'>('secundario');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addSecondaryGuardian({
      name,
      phone,
      relationship,
      role,
      isNotifiedOnSOS: true,
    });

    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleBroadcastAllWhatsApp = () => {
    if (!selectedChild) return;
    const notifiedGuardians = guardians.filter(g => g.isNotifiedOnSOS);
    
    const text = encodeURIComponent(
      `🚨 *GUARDIÃO KIDS - ALERTA DE EMERGÊNCIA FAMILIAR*\n\n` +
      `Mensagem enviada para a Rede de Segurança de *${selectedChild.name}*!\n` +
      `• *Status:* Monitoramento Ativo\n` +
      `• *Localização GPS:* https://maps.google.com/?q=${selectedChild.latitude},${selectedChild.longitude}\n` +
      `• *Bateria:* ${selectedChild.batteryLevel}%\n` +
      `• *Última Atividade:* ${selectedChild.lastSeen}\n\n` +
      `Por favor, fiquem atentos ou entrem em contato com a família.`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Rede de Guardiões da Família
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contatos de confiança (pais, avós, tios, escola) com disparo de pânico unificado
            </p>
          </div>
        </div>

        {/* Global Broadcast Button */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-indigo-700/40 mb-6 flex items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block mb-0.5">
              Alerta Geral Unificado
            </span>
            <p className="text-xs font-bold text-slate-200">
              Avisar todos os guardiões via WhatsApp em 1 clique
            </p>
          </div>
          <button
            type="button"
            onClick={handleBroadcastAllWhatsApp}
            className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span>Notificar Todos ({guardians.filter(g => g.isNotifiedOnSOS).length})</span>
          </button>
        </div>

        {/* Guardians List Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Guardiões Cadastrados ({guardians.length})
          </h4>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Cancelar' : 'Adicionar Guardião'}</span>
          </button>
        </div>

        {/* Form to Add New Guardian */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 mb-4 space-y-3 text-xs animate-in fade-in duration-200">
            <h5 className="font-black text-slate-900 dark:text-white">Novo Guardião de Confiança</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Vovó Maria"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Parentesco / Relação
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó/Avô">Avó / Avô</option>
                  <option value="Tio/Tia">Tio / Tia</option>
                  <option value="Padrinho/Madrinha">Padrinho / Madrinha</option>
                  <option value="Escola">Escola / Perua escolar</option>
                  <option value="Vizinho">Vizinho de Confiança</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nível do Guardião
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                >
                  <option value="principal">Guardião Principal (Acesso total)</option>
                  <option value="secundario">Guardião Secundário</option>
                  <option value="emergencia">Apenas Alerta de Emergência</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Salvar Guardião na Rede Familiar
            </button>
          </form>
        )}

        {/* List of Guardians */}
        <div className="space-y-3">
          {guardians.map((g) => {
            const cleanPhone = g.phone.replace(/\D/g, '');
            return (
              <div
                key={g.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    g.role === 'principal' 
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                      : g.role === 'secundario'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{g.name}</p>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {g.relationship}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {g.phone}
                    </p>
                  </div>
                </div>

                {/* Actions & SOS Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => toggleGuardianSOS(g.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all border ${
                      g.isNotifiedOnSOS
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                    title="Receber alertas de pânico SOS via WhatsApp"
                  >
                    <BellRing className="h-3 w-3" />
                    <span>{g.isNotifiedOnSOS ? 'Recebe SOS' : 'SOS Inativo'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                      title="Ligar"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/55${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all"
                      title="Mandar WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>

                    {g.role !== 'principal' && (
                      <button
                        type="button"
                        onClick={() => deleteSecondaryGuardian(g.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
