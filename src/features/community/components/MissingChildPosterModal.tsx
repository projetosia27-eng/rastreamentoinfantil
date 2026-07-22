import React, { useState, useEffect } from 'react';
import { Child } from '../../../domain/entities';
import { X, AlertTriangle, Printer, Share2, MapPin, Phone, ShieldAlert, Camera, Send, FileText, Upload, CheckCircle2, UserCheck, Shirt, User, Sparkles } from 'lucide-react';
import { triggerNearbyCaseAlert, triggerChildFoundAlert } from '../../../services/onesignal';
import { reverseGeocode } from '../../../services/addressService';

interface MissingChildPosterModalProps {
  child: Child;
  onClose: () => void;
  onPublishToCommunity?: (caseData: any) => void;
  onMarkAsFound?: (childName: string) => void;
}

export default function MissingChildPosterModal({ child, onClose, onPublishToCommunity, onMarkAsFound }: MissingChildPosterModalProps) {
  const [tab, setTab] = useState<'publish' | 'poster'>('publish');
  
  const [writtenAddress, setWrittenAddress] = useState('Buscando endereço...');
  const [clothingDescription, setClothingDescription] = useState('Camiseta azul, calça jeans, tênis branco e mochila amarela');
  const [physicalDescription, setPhysicalDescription] = useState('7 anos, 1.22m de altura, cabelo castanho e olhos claros');
  const [emergencyPhone, setEmergencyPhone] = useState(child.emergencyContact || '190 (Polícia) / (11) 99999-8888');
  
  // Fetch written address on mount
  useEffect(() => {
    let isMounted = true;
    reverseGeocode(child.latitude, child.longitude).then((addr) => {
      if (isMounted) {
        setWrittenAddress(addr);
      }
    });
    return () => { isMounted = false; };
  }, [child.latitude, child.longitude]);
  
  // Photo selection state
  const defaultPhoto = 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=300&h=300';
  const [photoUrl, setPhotoUrl] = useState(defaultPhoto);
  const [isPublished, setIsPublished] = useState(false);
  const [isChildFound, setIsChildFound] = useState(false);

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = {
      id: `case-${Date.now()}`,
      name: child.name,
      age: 7,
      lastSeenLocation: writtenAddress,
      dateMissing: new Date().toISOString(),
      status: 'active',
      description: `Roupas: ${clothingDescription} | Características: ${physicalDescription}`,
      image: photoUrl,
      contact: emergencyPhone,
    };

    if (onPublishToCommunity) {
      onPublishToCommunity(newCase);
    }

    triggerNearbyCaseAlert(child.name, writtenAddress);
    setIsPublished(true);
    setTab('poster');
  };

  const handleConfirmChildFound = () => {
    if (window.confirm(`Confirmar que ${child.name} foi encontrado(a) com segurança? O alerta da comunidade será encerrado.`)) {
      triggerChildFoundAlert(child.name);
      if (onMarkAsFound) {
        onMarkAsFound(child.name);
      }
      setIsChildFound(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900/50 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className={`p-6 relative flex items-center justify-between text-white transition-colors ${
          isChildFound ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              {isChildFound ? <CheckCircle2 className="h-7 w-7 text-white" /> : <ShieldAlert className="h-7 w-7 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isChildFound ? 'Criança Localizada com Segurança!' : 'Módulo de Alerta de Desaparecimento'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {isChildFound ? `Alerta para ${child.name} foi encerrado com sucesso.` : `Rede de Proteção e Cartaz de Busca para ${child.name}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors print:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Child Found Banner if resolved */}
        {isChildFound && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-emerald-800 dark:text-emerald-200 font-black text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              QUE ÓTIMA NOTÍCIA! {child.name.toUpperCase()} FOI ENCONTRADO(A)!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              A comunidade e a rede de contatos de emergência já foram notificadas da resolução.
            </p>
          </div>
        )}

        {/* Tab Selection */}
        {!isChildFound && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 print:hidden">
            <button
              onClick={() => setTab('publish')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                tab === 'publish'
                  ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Send className="h-4 w-4" />
              1. Publicar na Comunidade
            </button>
            <button
              onClick={() => setTab('poster')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                tab === 'poster'
                  ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              2. Gerar Cartaz de Busca (PDF/Impressão)
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {tab === 'publish' && !isChildFound && (
            <form onSubmit={handlePublish} className="space-y-4">
              {isPublished && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2">
                  <span>✅ Caso publicado na Rede Solidária e vizinhança notificada via Push!</span>
                  <button
                    type="button"
                    onClick={handleConfirmChildFound}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
                  >
                    Já encontrei!
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Criança</label>
                  <input 
                    type="text" 
                    value={child.name} 
                    disabled 
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone de Emergência</label>
                  <input 
                    type="text" 
                    value={emergencyPhone} 
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white"
                    placeholder="Ex: 190 / (11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                  <span>📍 Último Local Visto (Endereço escrito)</span>
                  <span className="text-[10px] text-indigo-500 font-normal">Obtido via GPS Automático</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={writtenAddress} 
                    onChange={e => setWrittenAddress(e.target.value)}
                    placeholder="Ex: Av. Paulista, 1500 - Bela Vista, São Paulo - SP"
                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <Shirt className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Roupas que estava usando</span>
                  </label>
                  <textarea 
                    value={clothingDescription}
                    onChange={e => setClothingDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white h-20 resize-none"
                    placeholder="Ex: Camiseta azul do Homem-Aranha, calça jeans, tênis branco com luzes..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Características Físicas / Idade</span>
                  </label>
                  <textarea 
                    value={physicalDescription}
                    onChange={e => setPhysicalDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white h-20 resize-none"
                    placeholder="Ex: 7 anos, 1.25m de altura, cabelo castanho cacheado, marca no joelho..."
                  ></textarea>
                </div>
              </div>

              {/* PHOTO SOURCE SELECTION (Upload vs Child Profile Avatar vs URL) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Foto para o Cartaz de Busca</label>
                
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-dashed border-slate-300 dark:border-slate-600">
                    <Upload className="h-4 w-4 text-indigo-500" />
                    <span>Upload do Dispositivo / Galeria</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setPhotoUrl(defaultPhoto)}
                    className="w-full sm:w-auto px-4 py-3 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
                  >
                    <UserCheck className="h-4 w-4" />
                    Foto de Perfil ({child.avatar || '👦'})
                  </button>
                </div>

                <div className="flex gap-2 items-center pt-1">
                  <input 
                    type="text" 
                    value={photoUrl} 
                    onChange={e => setPhotoUrl(e.target.value)}
                    placeholder="Ou cole a URL da imagem aqui..."
                    className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                    onError={(e) => { (e.target as HTMLElement).setAttribute('src', defaultPhoto); }}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                >
                  <Send className="h-4 w-4" />
                  Lançar Alerta na Rede Solidária
                </button>
                <button
                  type="button"
                  onClick={() => setTab('poster')}
                  className="py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition-all"
                >
                  Ver Cartaz de Busca
                </button>
              </div>
            </form>
          )}

          {(tab === 'poster' || isChildFound) && (
            <div className="space-y-4">
              
              {/* FOUND CONFIRMATION BANNER BUTTON */}
              {!isChildFound && (
                <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left print:hidden">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 justify-center sm:justify-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      Encontrou seu filho(a)?
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Clique no botão ao lado para notificar a rede e encerrar a busca.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmChildFound}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    CONFIRMAR QUE FOI ENCONTRADO!
                  </button>
                </div>
              )}

              {/* PRINTABLE POSTER CARD */}
              <div id="printable-poster" className={`border-4 bg-white text-slate-900 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center relative ${
                isChildFound ? 'border-emerald-600' : 'border-red-600'
              }`}>
                
                {/* Stamp if found */}
                {isChildFound && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600/95 text-white font-black text-3xl sm:text-4xl px-8 py-4 rounded-2xl border-4 border-white shadow-2xl rotate-[-8deg] z-20 pointer-events-none uppercase tracking-widest">
                    ✅ ENCONTRADO(A)!
                  </div>
                )}

                {/* Header Banner */}
                <div className={`w-full text-white py-3 px-4 rounded-xl mb-4 uppercase tracking-widest font-black text-2xl sm:text-3xl shadow-md ${
                  isChildFound ? 'bg-emerald-600' : 'bg-red-600'
                }`}>
                  {isChildFound ? '✅ CASO RESOLVIDO / ENCONTRADO(A)' : '🚨 PROCURA-SE / CRIANÇA DESAPARECIDA'}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 my-2 text-left w-full">
                  <img 
                    src={photoUrl} 
                    alt={child.name} 
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover border-4 border-slate-900 shadow-md shrink-0"
                    onError={(e) => { (e.target as HTMLElement).setAttribute('src', defaultPhoto); }}
                  />
                  
                  <div className="space-y-2.5 flex-1">
                    <h3 className="text-3xl font-black text-slate-900 uppercase leading-none">
                      {child.name}
                    </h3>
                    <p className={`text-xs font-bold inline-block px-3 py-1 rounded-lg border ${
                      isChildFound 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-red-600 bg-red-50 border-red-200'
                    }`}>
                      {isChildFound ? 'Encontrado e em segurança com a família!' : `Visto(a) pela última vez hoje às ${child.lastSeen}`}
                    </p>

                    <div className="text-xs space-y-2 text-slate-800 pt-2 border-t border-slate-200">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 font-extrabold uppercase text-[11px] block">Último Local Visto (Endereço):</strong>
                          <span className="text-slate-700 font-medium">{writtenAddress}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <Shirt className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 font-extrabold uppercase text-[11px] block">Roupas / Vestuário:</strong>
                          <span className="text-slate-700 font-medium">{clothingDescription}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <User className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 font-extrabold uppercase text-[11px] block">Características / Idade:</strong>
                          <span className="text-slate-700 font-medium">{physicalDescription}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Banner */}
                <div className="w-full bg-slate-900 text-white rounded-xl p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Contato dos responsáveis:</p>
                    <p className="text-xl sm:text-2xl font-black text-yellow-400">{emergencyPhone}</p>
                  </div>
                  <div className="px-4 py-2 bg-red-600 text-white font-extrabold text-sm rounded-lg uppercase">
                    POLÍCIA: 190
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-400 font-medium">
                  Alerta gerado via Guardião Kids — Rede de Proteção e Cuidado Familiar em Tempo Real
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Cartaz / Salvar em PDF
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `ALERTA: Criança Desaparecida - ${child.name}`,
                        text: `Ajude a encontrar ${child.name}! Visto(a) por último em: ${writtenAddress}. Roupas: ${clothingDescription}. Contato: ${emergencyPhone}`,
                      }).catch(() => {});
                    } else {
                      alert('Link e informações copiadas para a área de transferência!');
                    }
                  }}
                  className="py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

