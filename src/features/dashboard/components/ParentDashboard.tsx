import React, { useState, useEffect } from 'react';
import { useSignal } from '../../../core/signals';
import {
  childrenSignal,
  safeZonesSignal,
  selectedChildIdSignal,
  addSafeZone,
  deleteSafeZone,
  toggleSafeZoneActive,
  isSimulationActiveSignal,
  toggleSimulation,
  clearSOS,
  isPanicActiveSignal,
  updateProtectionMode,
  updateChildLocation,
  activeTabSignal
} from '../../../data/app-state-store';
import { calculateChildLevel } from '../../../domain/use-cases';
import InteractiveMap from '../../map/components/InteractiveMap';
import LiveNavigationMap from '../../map/components/LiveNavigationMap';
import NotificationLog from '../../alerts/components/NotificationLog';
import TaskBoard from '../../tasks/components/TaskBoard';
import RewardStore from '../../rewards/components/RewardStore';
import SupabaseDashboard from '../../supabase/components/SupabaseDashboard';
import ChildManagerModal from './ChildManagerModal';
import ProtectionModule from './ProtectionModule';
import EmergencyFlowModal from './EmergencyFlowModal';
import MissingChildPosterModal from '../../community/components/MissingChildPosterModal';
import CommunityModule from '../../community/components/CommunityModule';
import { useDeviceGPS, getAccuratePosition } from '../../../services/gpsService';
import { reverseGeocode } from '../../../services/addressService';
import {
  Plus,
  Database,
  Compass,
  Trophy,
  Gift,
  Bell,
  Trash2,
  Shield,
  ShieldAlert,
  Battery,
  Sparkles,
  MapPin,
  Clock,
  Play,
  Square,
  VolumeX,
  PlusCircle,
  HelpCircle,
  ShoppingBag,
  Hand,
  AlertTriangle,
  Users,
  Settings2,
  Watch,
  Smartphone,
  Tag,
  Radio,
  FileText,
  Navigation,
  LayoutDashboard,
  Crosshair,
  ArrowRight,
  Activity,
  Phone
} from 'lucide-react';

export default function ParentDashboard() {
  const children = useSignal(childrenSignal);
  const safeZones = useSignal(safeZonesSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);
  const isSimulationActive = useSignal(isSimulationActiveSignal);
  const isPanicActive = useSignal(isPanicActiveSignal);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const activeTab = useSignal(activeTabSignal);
  const setActiveTab = (tab: any) => activeTabSignal.set(tab);
  const [mapSubTab, setMapSubTab] = useState<'waze' | 'zones'>('waze');
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childToEditId, setChildToEditId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [syncGpsText, setSyncGpsText] = useState<string | null>(null);
  const [currentAddressText, setCurrentAddressText] = useState<string>('Carregando endereço...');

  const { location: parentGps, refreshGPS } = useDeviceGPS();

  const childLevelInfo = selectedChild ? calculateChildLevel(selectedChild.xp) : { level: 1, currentXp: 0, percentage: 0 };

  // Auto-open emergency modal when SOS/panic is active
  useEffect(() => {
    if (isPanicActive) {
      setShowEmergencyModal(true);
    }
  }, [isPanicActive]);

  // Fetch written address for active child
  useEffect(() => {
    let active = true;
    if (selectedChild) {
      reverseGeocode(selectedChild.latitude, selectedChild.longitude).then((addr) => {
        if (active) setCurrentAddressText(addr);
      });
    }
    return () => { active = false; };
  }, [selectedChild?.latitude, selectedChild?.longitude]);

  // Sync real device location
  const handleSyncRealGPS = async () => {
    setSyncGpsText('Capturando GPS do celular...');
    const pos = await getAccuratePosition();
    if (selectedChild) {
      updateChildLocation(selectedChild.id, pos.latitude, pos.longitude);
      setSyncGpsText('GPS atualizado!');
      setTimeout(() => setSyncGpsText(null), 3000);
    }
  };

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Database className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Nenhuma Criança Cadastrada</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Parece que você ainda não tem filhos cadastrados. Sincronize com o banco de dados ou adicione o primeiro perfil para começar.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddChildModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Criança
          </button>
        </div>
        {showAddChildModal && (
          <ChildManagerModal 
            onClose={() => setShowAddChildModal(false)} 
          />
        )}
      </div>
    );
  }

  const isAvatarImage = selectedChild.avatar && (
    selectedChild.avatar.startsWith('http') || 
    selectedChild.avatar.startsWith('data:') || 
    selectedChild.avatar.includes('/')
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 lg:pb-0" id="parent-dashboard-layout">
      
      {/* SOS/PANIC BROADCAST BANNER */}
      {isPanicActive && (
        <div className="col-span-12 bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3.5 animate-bounce shadow-lg shadow-red-500/15" id="parent-panic-siren-banner">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-full animate-ping" style={{ animationDuration: '1.5s' }}>
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-red-700 dark:text-red-400">🚨 ALERTA GERAL DE SEGURANÇA</h2>
              <p className="text-xs text-red-600 dark:text-red-300">Sua criança ativou o sinal de SOS em pânico. Verifique a localização imediatamente!</p>
            </div>
          </div>
          <button
            onClick={clearSOS}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-md"
          >
            <VolumeX className="h-4 w-4" />
            Desligar Sirene & Cancelar Alerta
          </button>
        </div>
      )}

      {/* LEFT COLUMN: CHILD SELECTOR & QUICK CONFIG */}
      <div className="col-span-12 lg:col-span-4 space-y-5 lg:sticky lg:top-24 h-max">
        
        {/* Child Selection list & Add child */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Perfis Monitorados</h4>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500 rounded-full transition-colors"
              title="Adicionar Nova Criança"
            >
              <PlusCircle className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId;
              const childHasImage = child.avatar && (child.avatar.startsWith('http') || child.avatar.startsWith('data:') || child.avatar.includes('/'));
              return (
                <button
                  key={child.id}
                  onClick={() => selectedChildIdSignal.set(child.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/15'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {childHasImage ? (
                    <img src={child.avatar} alt={child.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <span>{child.avatar || '👦'}</span>
                  )}
                  <span className="truncate max-w-[100px]">{child.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CHILD SUMMARY CARD */}
        {selectedChild && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 min-w-0">
                <div className="relative shrink-0">
                  {isAvatarImage ? (
                    <img src={selectedChild.avatar} alt={selectedChild.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <span className="text-3xl p-1 bg-slate-100 dark:bg-slate-800 rounded-xl inline-block">{selectedChild.avatar || '👦'}</span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                    <span className="truncate">{selectedChild.name}</span>
                    <button
                      onClick={() => setChildToEditId(selectedChild.id)}
                      className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors shrink-0"
                      title="Editar perfil"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </button>
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/50">
                      {(!selectedChild.deviceType || selectedChild.deviceType === 'smartwatch') ? 'Smartwatch 4G' : 'Celular'}
                    </span>
                    {selectedChild.phone && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-100 dark:border-emerald-900/50">
                        <Phone className="h-3 w-3 text-emerald-500" />
                        {selectedChild.phone}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                      selectedChild.batteryLevel > 50
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : selectedChild.batteryLevel >= 20
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 animate-pulse'
                    }`}>
                      <Battery className={`h-3.5 w-3.5 ${
                        selectedChild.batteryLevel > 50 ? 'text-emerald-500' : selectedChild.batteryLevel >= 20 ? 'text-amber-500' : 'text-red-500'
                      }`} />
                      <span>{selectedChild.batteryLevel}% Bateria</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50">
                  💰 {selectedChild.coins}
                </span>
              </div>
            </div>

            {/* GPS Telemetry Address */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-500 shrink-0" />
                <p className="truncate font-bold text-slate-800 dark:text-slate-200">{currentAddressText}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Coordenadas: {selectedChild.latitude.toFixed(5)}, {selectedChild.longitude.toFixed(5)}</p>
            </div>

            {/* Emergency & Poster Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-900/30"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Não Encontro Meu Filho
              </button>

              <button
                onClick={() => setShowPosterModal(true)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20"
              >
                <FileText className="h-3.5 w-3.5" />
                Gerar Cartaz & Alerta
              </button>
            </div>
          </div>
        )}

        {/* GPS Movement Simulator Control */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Simulador de Movimento GPS</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSimulationActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {isSimulationActive ? 'Ativo' : 'Pausado'}
            </span>
          </div>

          <button
            onClick={toggleSimulation}
            className={`w-full py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              isSimulationActive ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {isSimulationActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isSimulationActive ? 'Pausar Simulação GPS' : 'Iniciar Simulação de Rota'}</span>
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: MAIN CONTENT TABS */}
      <div className="col-span-12 lg:col-span-8 flex flex-col space-y-5">
        
        {/* Navigation Tab Bar (Desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl gap-1 shadow-xs">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Resumo' },
            { id: 'map', icon: Compass, label: 'Rastreamento Vivo' },
            { id: 'tasks', icon: Trophy, label: 'Missões' },
            { id: 'rewards', icon: Gift, label: 'Recompensas' },
            { id: 'alerts', icon: Bell, label: 'Mural' },
            { id: 'protection', icon: Shield, label: 'Proteção' },
            { id: 'community', icon: Users, label: 'Comunidade' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Material 3 Bottom Navigation (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F0F4F8] dark:bg-[#1E1E24] flex justify-around items-center pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] border-t border-slate-200/50 dark:border-slate-800/50 min-h-[75px] px-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Resumo' },
            { id: 'map', icon: Compass, label: 'Mapa' },
            { id: 'tasks', icon: Trophy, label: 'Missões' },
            { id: 'protection', icon: Shield, label: 'Proteção' },
            { id: 'community', icon: Users, label: 'Rede' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className="flex flex-col items-center justify-center w-full py-1.5 gap-1"
            >
              <div className={`px-4 py-1 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'fill-indigo-700 dark:fill-indigo-300' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${activeTab === tab.id ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* DYNAMIC TAB CONTENT */}
        <div className="flex-1">
          
          {/* TAB 1: EXECUTIVE PREMIUM DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && selectedChild && (
            <div className="space-y-5">
              
              {/* Executive Welcome Hero Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-indigo-500/30">
                      Painel Premium de Controle Familiar
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black mt-2">
                      Monitorando <span className="text-cyan-400">{selectedChild.name}</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg">
                      Visualização unificada de localização GPS, modos de segurança ativos, tarefas diárias e alertas comunitários.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncRealGPS}
                    className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 shrink-0"
                  >
                    <Crosshair className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>{syncGpsText || '📍 Usar GPS do Celular'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Endereço GPS</span>
                    <MapPin className="h-4 w-4 text-cyan-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentAddressText.split('-')[0]}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">Sincronizado</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bateria</span>
                    <Battery className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedChild.batteryLevel}%</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Bateria Normal</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nível & XP</span>
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">Nível {childLevelInfo.level}</p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">{selectedChild.xp} XP acumulados</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cercas</span>
                    <Shield className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{safeZones.filter(z => z.isActive).length} Ativas</p>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-1">Monitoramento On</span>
                </div>

              </div>

              {/* Quick Action Navigation Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Módulos do Sistema</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-500 text-slate-950 rounded-xl font-black">
                        <Compass className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Rastreamento Waze & Foto da Rua</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ver mapa em tempo real e visualização do entorno</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-black">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Gerenciar Tarefas & Hábitos</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Atribuir missões diárias e aprovar recompensas</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setActiveTab('protection')}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-600 text-white rounded-xl font-black">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Modos de Segurança & Alertas</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ativar Modo Shopping, Mão Solta e Perímetro</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setActiveTab('community')}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-600 text-white rounded-xl font-black">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Rede de Apoio Comunitária</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Mural comunitário e publicação de cartazes</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DEDICATED MAP & STREET PHOTO MODULE */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 gap-2">
                <button
                  onClick={() => setMapSubTab('waze')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    mapSubTab === 'waze'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  Rastreamento Waze & Foto da Rua
                </button>

                <button
                  onClick={() => setMapSubTab('zones')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    mapSubTab === 'zones'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Cercas Virtuais & Teleporte
                </button>
              </div>

              {mapSubTab === 'waze' ? <LiveNavigationMap /> : <InteractiveMap />}
            </div>
          )}

          {activeTab === 'tasks' && selectedChild && (
            <TaskBoard role="parent" childId={selectedChild.id} />
          )}

          {activeTab === 'rewards' && selectedChild && (
            <RewardStore role="parent" childId={selectedChild.id} />
          )}

          {activeTab === 'protection' && selectedChild && (
            <ProtectionModule childId={selectedChild.id} />
          )}

          {activeTab === 'alerts' && (
            <NotificationLog />
          )}

          {activeTab === 'supabase' && (
            <SupabaseDashboard />
          )}
          
          {activeTab === 'community' && (
            <CommunityModule />
          )}
        </div>

      </div>

      {/* CREATE / EDIT CHILD MODAL */}
      {(showAddChildModal || childToEditId) && (
        <ChildManagerModal 
          onClose={() => {
            setShowAddChildModal(false);
            setChildToEditId(null);
          }} 
          childToEdit={childToEditId ? children.find(c => c.id === childToEditId) : null} 
        />
      )}

      {showEmergencyModal && selectedChild && (
        <EmergencyFlowModal
          child={selectedChild}
          onClose={() => setShowEmergencyModal(false)}
          onOpenMap={() => setActiveTab('map')}
          onOpenPoster={() => setShowPosterModal(true)}
        />
      )}

      {showPosterModal && selectedChild && (
        <MissingChildPosterModal
          child={selectedChild}
          onClose={() => setShowPosterModal(false)}
          onPublishToCommunity={() => setActiveTab('community')}
        />
      )}
    </div>
  );
}

