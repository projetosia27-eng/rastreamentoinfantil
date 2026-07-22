import React, { useState } from 'react';
import { triggerNearbyCaseAlert, triggerChildFoundAlert } from '../../../services/onesignal';
import { Search, Camera, MapPin, AlertCircle, Phone, ArrowRight, ShieldAlert, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import MissingChildPosterModal from './MissingChildPosterModal';
import { useSignal } from '../../../core/signals';
import { childrenSignal } from '../../../data/app-state-store';

interface Case {
  id: string;
  name: string;
  age: number;
  lastSeenLocation: string;
  dateMissing: string;
  status: 'active' | 'resolved';
  description: string;
  image: string;
}

const mockCases: Case[] = [
  {
    id: '1',
    name: 'Lucas Silva',
    age: 7,
    lastSeenLocation: 'Parque Ibirapuera, SP',
    dateMissing: '2026-07-20T08:30:00Z',
    status: 'active',
    description: 'Vestindo camiseta azul e bermuda jeans. Visto pela última vez perto do parquinho.',
    image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '2',
    name: 'Mariana Costa',
    age: 5,
    lastSeenLocation: 'Shopping Morumbi, SP',
    dateMissing: '2026-07-19T14:15:00Z',
    status: 'active',
    description: 'Vestido rosa, laço no cabelo. Se perdeu na praça de alimentação.',
    image: 'https://images.unsplash.com/photo-1519238263530-99abad67b86e?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export default function CommunityModule() {
  const childrenList = useSignal(childrenSignal);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'report'>('list');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showPoster, setShowPoster] = useState(false);

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsFound = (caseIdOrName: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseIdOrName || c.name.toLowerCase() === caseIdOrName.toLowerCase()) {
        return { ...c, status: 'resolved' };
      }
      return c;
    }));
    triggerChildFoundAlert(caseIdOrName);
  };

  const handleAddCase = (newCaseData: any) => {
    setCases(prev => [newCaseData, ...prev]);
    setShowPoster(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            Rede de Proteção Solidária
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comunidade unida para encontrar crianças perdidas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowPoster(true)}
            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            <FileText className="h-4 w-4" />
            Gerar Cartaz de Busca
          </button>

          {view === 'list' ? (
            <button 
              onClick={() => setView('report')}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md"
            >
              <Camera className="h-4 w-4" />
              Enviar Avistamento
            </button>
          ) : (
            <button 
              onClick={() => setView('list')}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Voltar para Casos
            </button>
          )}
        </div>
      </div>

      {view === 'list' && (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar por nome ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {filteredCases.map(c => (
              <div key={c.id} className={`border rounded-2xl p-4 flex gap-4 transition-colors ${
                c.status === 'resolved' 
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-indigo-800/50'
              }`}>
                <img src={c.image} alt={c.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">{c.name}, {c.age}a</h3>
                      {c.status === 'resolved' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> ENCONTRADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          PROCURANDO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="text-xs line-clamp-1">{c.lastSeenLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                    {c.status === 'active' ? (
                      <>
                        <button 
                          onClick={() => { setSelectedCase(c); setView('report'); }}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                        >
                          Reportar avistamento <ArrowRight className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleMarkAsFound(c.id)} 
                          className="text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                          title="Clique para confirmar que esta criança foi encontrada"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Marcar Encontrado
                        </button>
                      </>
                    ) : (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Criança localizada e em segurança!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCases.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Nenhum caso encontrado.</p>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'report' && (
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-500" />
            Reportar Avistamento {selectedCase ? `para ${selectedCase.name}` : ''}
          </h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Localização do Avistamento (Mapa)</label>
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-300 dark:border-slate-700">
                <MapPin className="h-8 w-8 text-slate-400 mb-2" />
                <span className="absolute bottom-3 text-xs font-medium text-slate-500">Clique para fixar no mapa</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Foto do Local ou Pessoa (Opcional)</label>
              <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <ImageIcon className="h-6 w-6 mb-1 text-slate-400" />
                <span className="text-xs font-medium">Anexar imagem</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Detalhes / Observações</label>
              <textarea 
                className="w-full h-24 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white resize-none"
                placeholder="Descreva o que você viu, roupas, direção em que estava indo..."
              ></textarea>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button 
              onClick={() => {
                alert("Avistamento enviado com sucesso! As autoridades e familiares foram notificados.");
                setView('list');
                setSelectedCase(null);
              }}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md w-full sm:w-auto"
            >
              <AlertCircle className="h-4 w-4" />
              Enviar Alerta de Avistamento
            </button>
          </div>
        </div>
      )}

      {showPoster && (
        <MissingChildPosterModal
          child={childrenList[0] || {
            id: 'demo-child',
            name: 'Lucas Silva',
            avatar: '👦',
            batteryLevel: 85,
            lastSeen: 'Há 5 minutos',
            latitude: -23.5505,
            longitude: -46.6333,
            currentSafeZoneId: null,
            protectionMode: 'standard',
            xp: 150,
            coins: 50
          }}
          onClose={() => setShowPoster(false)}
          onPublishToCommunity={handleAddCase}
          onMarkAsFound={(childName) => handleMarkAsFound(childName)}
        />
      )}
    </div>
  );
}

