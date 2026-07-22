import React, { useState, useEffect, useRef } from 'react';
import { supabase, url, key, isConfigured, initializeSupabaseWithCredentials, clearSupabaseCredentials } from '../../../services/supabaseClient';
import { supabaseAuthService } from '../../../services/supabaseAuthService';
import { supabaseDatabaseService } from '../../../services/supabaseDatabaseService';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { supabaseRealtimeService } from '../../../services/supabaseRealtimeService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { 
  Database, Shield, HardDrive, Wifi, CheckCircle2, AlertTriangle, 
  Settings, Key, Copy, Check, Eye, EyeOff, LogIn, LogOut, 
  UserPlus, Upload, RefreshCw, Terminal, Plus, Trash2, ArrowRight
} from 'lucide-react';

export default function SupabaseDashboard() {
  // Config state
  const [supabaseUrl, setSupabaseUrl] = useState(url);
  const [supabaseKey, setSupabaseKey] = useState(key);
  const [showKey, setShowKey] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Connection testing states
  const [authStatus, setAuthStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [dbStatus, setDbStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [storageStatus, setStorageStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [realtimeStatus, setRealtimeStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // Auth Sandbox State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Database / Realtime state
  const [activeTable, setActiveTable] = useState<'children' | 'safe_zones' | 'tasks' | 'rewards' | 'alerts'>('alerts');
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [realtimeLogs, setRealtimeLogs] = useState<Array<{ timestamp: string; event: string; table: string; data: any }>>([]);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Storage state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storageBucket, setStorageBucket] = useState('guardian-kids');
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [storageMessage, setStorageMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load user session & run diagnostics on load
  useEffect(() => {
    if (isConfigured) {
      checkAuthSession();
      runAllDiagnostics();
      loadStorageFiles();
    }
  }, []);

  // Set up real-time listener when table selection changes
  useEffect(() => {
    if (isConfigured && supabase) {
      // Cleanup previous subscription
      if (realtimeChannelRef.current) {
        supabaseRealtimeService.unsubscribeChannel(realtimeChannelRef.current);
      }

      // Start new subscription
      const channel = supabaseRealtimeService.subscribeToTable(
        activeTable,
        '*',
        (payload) => {
          const newLog = {
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            event: payload.eventType,
            table: activeTable,
            data: payload.new || payload.old
          };
          setRealtimeLogs(prev => [newLog, ...prev].slice(0, 20));
          // Refresh item list
          loadTableItems();
        }
      );

      realtimeChannelRef.current = channel;
      setRealtimeStatus('ok');

      // Load initial table items
      loadTableItems();
    }

    return () => {
      if (realtimeChannelRef.current) {
        supabaseRealtimeService.unsubscribeChannel(realtimeChannelRef.current);
      }
    };
  }, [activeTable]);

  const checkAuthSession = async () => {
    try {
      const user = await supabaseAuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.warn('Auth session check failed:', e);
    }
  };

  const runAllDiagnostics = async () => {
    if (!isConfigured) return;
    setDiagnosticError(null);

    // 1. Check Auth
    try {
      setAuthStatus('unchecked');
      await supabaseAuthService.getSession();
      setAuthStatus('ok');
    } catch (e: any) {
      setAuthStatus('error');
      setDiagnosticError(`Auth: ${e.message}`);
    }

    // 2. Check Database by doing a select limit 1
    try {
      setDbStatus('unchecked');
      if (supabase) {
        const { error } = await supabase.from('alerts').select('*').limit(1);
        if (error) throw error;
        setDbStatus('ok');
      }
    } catch (e: any) {
      setDbStatus('error');
      setDiagnosticError(prev => (prev ? `${prev}\n` : '') + `Database: ${e.message}`);
    }

    // 3. Check Storage by checking list bucket files
    try {
      setStorageStatus('unchecked');
      if (supabase) {
        await supabaseStorageService.listFiles(storageBucket, '');
        setStorageStatus('ok');
      }
    } catch (e: any) {
      setStorageStatus('error');
      setDiagnosticError(prev => (prev ? `${prev}\n` : '') + `Storage: ${e.message}`);
    }
  };

  // Credentials form submission
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      initializeSupabaseWithCredentials(supabaseUrl.trim(), supabaseKey.trim());
    }
  };

  // Database operations sandbox
  const loadTableItems = async () => {
    if (!isConfigured) return;
    setDbLoading(true);
    try {
      let items: any[] = [];
      if (activeTable === 'children') {
        items = await supabaseDatabaseService.getChildren();
      } else if (activeTable === 'safe_zones') {
        items = await supabaseDatabaseService.getSafeZones();
      } else if (activeTable === 'tasks') {
        items = await supabaseDatabaseService.getTasks();
      } else if (activeTable === 'rewards') {
        items = await supabaseDatabaseService.getRewards();
      } else if (activeTable === 'alerts') {
        items = await supabaseDatabaseService.getAlerts();
      }
      setDbItems(items);
    } catch (e) {
      console.warn(`Could not load database table "${activeTable}". Likely the schema is not deployed yet.`);
      setDbItems([]);
    } finally {
      setDbLoading(false);
    }
  };

  const handleSimulateInsert = async () => {
    if (!isConfigured) return;
    try {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      if (activeTable === 'alerts') {
        await supabaseDatabaseService.upsertAlert({
          id: `alert-demo-${Date.now()}`,
          childId: 'child-1',
          childName: 'Lucas',
          type: 'geofence_enter',
          message: `📡 Alerta Teste: Sincronização em tempo real realizada com sucesso às ${timestamp}!`,
          timestamp,
          isRead: false
        });
      } else if (activeTable === 'safe_zones') {
        await supabaseDatabaseService.upsertSafeZone({
          id: `sz-demo-${Date.now()}`,
          name: `Cerca de Teste ${timestamp}`,
          latitude: -23.55052,
          longitude: -46.633308,
          radius: 150,
          isActive: true,
          type: 'custom'
        });
      } else if (activeTable === 'tasks') {
        await supabaseDatabaseService.upsertTask({
          id: `task-demo-${Date.now()}`,
          childId: 'child-1',
          title: `Missão Sincronizada ${timestamp}`,
          description: 'Sincronizado automaticamente via Supabase Realtime!',
          rewardCoins: 25,
          isCompleted: false,
          isApproved: false,
          category: 'study'
        });
      } else if (activeTable === 'rewards') {
        await supabaseDatabaseService.upsertReward({
          id: `rew-demo-${Date.now()}`,
          childId: 'child-1',
          title: `Prêmio de Teste ${timestamp}`,
          description: 'Sincronizado na nuvem',
          costCoins: 30,
          isRedeemed: false,
          isApproved: false
        });
      } else if (activeTable === 'children') {
        await supabaseDatabaseService.upsertChild({
          id: `child-demo-${Date.now()}`,
          name: `Criança ${timestamp}`,
          avatar: '🦉',
          latitude: -23.55052,
          longitude: -46.633308,
          lastSeen: timestamp,
          batteryLevel: 98,
          currentSafeZoneId: null,
          coins: 10,
          xp: 15,
          protectionMode: 'standard'
        });
      }
      loadTableItems();
    } catch (e: any) {
      alert(`Erro ao inserir item na tabela "${activeTable}": ${e.message}\nCertifique-se de executar o script SQL no editor do seu painel Supabase.`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      if (activeTable === 'alerts') {
        await supabaseDatabaseService.deleteAlert(id);
      } else if (activeTable === 'safe_zones') {
        await supabaseDatabaseService.deleteSafeZone(id);
      } else if (activeTable === 'tasks') {
        await supabaseDatabaseService.deleteTask(id);
      } else if (activeTable === 'rewards') {
        await supabaseDatabaseService.deleteReward(id);
      } else if (activeTable === 'children') {
        await supabaseDatabaseService.deleteChild(id);
      }
      loadTableItems();
    } catch (e: any) {
      alert(`Falha ao excluir item: ${e.message}`);
    }
  };

  // Auth Sandbox Operations
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      await supabaseAuthService.signUp(authEmail, authPassword, authName);
      setAuthMessage({ type: 'success', text: 'Cadastro realizado! Verifique o e-mail se necessário ou faça login.' });
    } catch (e: any) {
      setAuthMessage({ type: 'error', text: e.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const data = await supabaseAuthService.signIn(authEmail, authPassword);
      setCurrentUser(data.user);
      setAuthMessage({ type: 'success', text: `Bem-vindo, ${data.user?.user_metadata?.display_name || data.user?.email}!` });
      runAllDiagnostics();
    } catch (e: any) {
      setAuthMessage({ type: 'error', text: e.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await supabaseAuthService.signOut();
      setCurrentUser(null);
      setAuthMessage({ type: 'success', text: 'Você se desconectou do Supabase Auth.' });
    } catch (e: any) {
      setAuthMessage({ type: 'error', text: e.message });
    } finally {
      setAuthLoading(false);
    }
  };

  // Storage Operations Sandbox
  const loadStorageFiles = async () => {
    if (!isConfigured) return;
    try {
      const files = await supabaseStorageService.listFiles(storageBucket, '');
      setStorageFiles(files);
    } catch (e) {
      console.warn('Could not load storage files list. Bucket may not exist yet.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setStorageMessage(null);

    try {
      const path = `uploads/${Date.now()}-${selectedFile.name}`;
      const result = await supabaseStorageService.uploadFile(storageBucket, path, selectedFile);
      setStorageMessage({ type: 'success', text: `Arquivo enviado com sucesso para ${result.path}!` });
      setSelectedFile(null);
      loadStorageFiles();
    } catch (e: any) {
      setStorageMessage({ type: 'error', text: e.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStorageFile = async (name: string) => {
    try {
      await supabaseStorageService.deleteFile(storageBucket, name);
      setStorageMessage({ type: 'success', text: 'Arquivo removido com sucesso!' });
      loadStorageFiles();
    } catch (e: any) {
      setStorageMessage({ type: 'error', text: e.message });
    }
  };

  const copySQLToClipboard = () => {
    const sql = `-- 1. Safe Zones (Cercas Virtuais)
create table safe_zones (
  id text primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius double precision not null,
  is_active boolean default true,
  type text not null
);

-- 2. Children (Crianças)
create table children (
  id text primary key,
  name text not null,
  avatar text not null,
  latitude double precision not null,
  longitude double precision not null,
  last_seen text not null,
  battery_level integer not null default 100,
  current_safe_zone_id text references safe_zones(id) on delete set null,
  coins integer default 0,
  xp integer default 0
);

-- 3. Tasks (Missões)
create table tasks (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  reward_coins integer not null default 0,
  is_completed boolean default false,
  is_approved boolean default false,
  category text not null,
  due_date text
);

-- 4. Rewards (Recompensas)
create table rewards (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  cost_coins integer not null default 0,
  is_redeemed boolean default false,
  is_approved boolean default false
);

-- 5. Alerts (Histórico de Alertas)
create table alerts (
  id text primary key,
  child_id text references children(id) on delete cascade,
  child_name text not null,
  type text not null,
  message text not null,
  timestamp text not null,
  is_read boolean default false,
  latitude double precision,
  longitude double precision
);

-- Habilitar replicação em tempo real no Supabase
alter publication supabase_realtime add table children;
alter publication supabase_realtime add table safe_zones;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table rewards;
alter publication supabase_realtime add table alerts;`;

    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="space-y-6" id="supabase-diagnostics-dashboard">
      
      {/* HEADER DESCRIPTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 rounded-2xl shrink-0">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Central de Integração Supabase
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Módulos Ativos
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Console de diagnóstico e sincronização para conectar o Guardião Kids ao Supabase.
              Abaixo você pode configurar suas credenciais, testar e utilizar os serviços reutilizáveis de 
              <strong> Auth</strong>, <strong>Database</strong>, <strong>Storage</strong> e <strong>Realtime</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: CONFIGURATION & DIAGNOSTICS */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* CONFIGURATION CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Credenciais do Projeto
            </h3>

            {isConfigured ? (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    Supabase Configurado
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Sua aplicação está integrada com as credenciais abaixo.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400">URL do Projeto:</span>
                    <p className="font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800 truncate select-all mt-1">
                      {url}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Chave Pública Anon:</span>
                    <div className="relative mt-1">
                      <input
                        type={showKey ? "text" : "password"}
                        readOnly
                        value={key}
                        className="w-full font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-2 pr-10 rounded-xl border border-slate-200/40 dark:border-slate-800 truncate select-all"
                      />
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearSupabaseCredentials}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Substituir Credenciais
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    Chaves não encontradas no .env
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Para habilitar o salvamento em nuvem, você pode preencher abaixo para testar imediatamente no navegador, ou adicioná-las no arquivo <code>.env</code>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Supabase Project URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://your-project.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Anon API Key</label>
                    <input
                      type="text"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/15"
                >
                  <Key className="h-4 w-4" />
                  Conectar Supabase
                </button>
              </form>
            )}
          </div>

          {/* DIAGNOSTIC LIGHTS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="h-4 w-4" />
                Painel de Conectividade
              </h3>
              {isConfigured && (
                <button 
                  onClick={runAllDiagnostics}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full text-slate-400"
                  title="Recarregar diagnósticos"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Autenticação (Auth)</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  !isConfigured ? 'bg-slate-100 text-slate-400' : 
                  authStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 
                  authStatus === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {!isConfigured ? 'Inativo' : authStatus === 'ok' ? 'Conectado' : authStatus === 'error' ? 'Erro' : 'Testando...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Banco de Dados (Database)</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  !isConfigured ? 'bg-slate-100 text-slate-400' : 
                  dbStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 
                  dbStatus === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {!isConfigured ? 'Inativo' : dbStatus === 'ok' ? 'Conectado' : dbStatus === 'error' ? 'Tabela Ausente' : 'Testando...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Arquivos (Storage)</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  !isConfigured ? 'bg-slate-100 text-slate-400' : 
                  storageStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 
                  storageStatus === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {!isConfigured ? 'Inativo' : storageStatus === 'ok' ? 'Conectado' : storageStatus === 'error' ? 'Bucket Ausente' : 'Testando...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Tempo Real (Realtime)</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  !isConfigured ? 'bg-slate-100 text-slate-400' : 
                  realtimeStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {!isConfigured ? 'Inativo' : realtimeStatus === 'ok' ? 'Escutando' : 'Configurando...'}
                </span>
              </div>
            </div>

            {diagnosticError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/40 rounded-2xl text-[10px] font-mono leading-relaxed max-h-24 overflow-y-auto">
                <strong>Alerta Técnico:</strong><br />
                {diagnosticError}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: SERVICES TEST INTERFACES */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* TAB BAR FOR SERVICE SANDBOX */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-indigo-500" />
                Playground e Testes dos Módulos Reutilizáveis
              </h3>
              <p className="text-xs text-slate-500 mt-1">Interaja com os serviços e veja a replicação em tempo real em ação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AUTH SANDBOX MODULE */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  Módulo 1: Auth (Controle de Usuários)
                </h4>

                {!isConfigured ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Conecte o Supabase para habilitar o painel de autenticação.</p>
                ) : currentUser ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                      <p className="font-bold text-slate-700 dark:text-slate-200">Logado como:</p>
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{currentUser.email}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Nome: {currentUser.user_metadata?.display_name || 'Não fornecido'}</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-2">ID: {currentUser.id}</p>
                    </div>

                    {authMessage && (
                      <p className={`text-[11px] font-semibold ${authMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {authMessage.text}
                      </p>
                    )}

                    <button
                      onClick={handleSignOut}
                      disabled={authLoading}
                      className="w-full py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out (Desconectar)
                    </button>
                  </div>
                ) : (
                  <form className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="nome@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Senha</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Nome Exibido (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Lucas Parent"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none"
                      />
                    </div>

                    {authMessage && (
                      <p className={`text-[10px] font-semibold ${authMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {authMessage.text}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSignIn}
                        disabled={authLoading}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-1"
                      >
                        <LogIn className="h-3.5 w-3.5" /> Entrar
                      </button>
                      <button
                        onClick={handleSignUp}
                        disabled={authLoading}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg flex items-center justify-center gap-1"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Cadastrar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* STORAGE SANDBOX MODULE */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <HardDrive className="h-4 w-4 text-emerald-500" />
                    Módulo 2: Storage (Arquivos & Avatares)
                  </h4>

                  {!isConfigured ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Conecte o Supabase para gerenciar buckets e arquivos.</p>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <form onSubmit={handleFileUpload} className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Nome do Bucket"
                            value={storageBucket}
                            onChange={(e) => setStorageBucket(e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded text-[11px]"
                            title="Nome do bucket no Supabase"
                          />
                          <span className="text-slate-400 self-center">Bucket</span>
                        </div>

                        <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex flex-col items-center">
                          <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            className="text-[10px] w-full"
                          />
                        </div>

                        {storageMessage && (
                          <p className={`text-[10px] font-semibold ${storageMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {storageMessage.text}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={uploading || !selectedFile}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploading ? 'Enviando...' : 'Fazer Upload para Nuvem'}
                        </button>
                      </form>

                      {/* Storage files list preview */}
                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-855">
                        <p className="font-bold text-slate-500 mb-2 text-[10px]">Arquivos Recentes no Bucket:</p>
                        {storageFiles.length === 0 ? (
                          <p className="text-[10px] text-slate-400">Nenhum arquivo listado ou bucket sem acesso público.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {storageFiles.map((file) => (
                              <div key={file.id || file.name} className="flex justify-between items-center p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px]">
                                <span className="truncate max-w-[150px] font-mono text-[9px]">{file.name}</span>
                                <div className="flex gap-2">
                                  <a
                                    href={supabaseStorageService.getPublicUrl(storageBucket, file.name)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 font-bold hover:underline"
                                  >
                                    Ver
                                  </a>
                                  <button
                                    onClick={() => handleDeleteStorageFile(file.name)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* DATABASE & REALTIME BROADCAST COMBINED SANDBOX */}
            <div className="mt-6 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-amber-500" />
                  Módulo 3: Database & Realtime Sync Testbed
                </h4>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTable}
                    onChange={(e) => setActiveTable(e.target.value as any)}
                    className="px-2 py-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="alerts">Tabela: alerts (Alertas) 🚨</option>
                    <option value="children">Tabela: children (Crianças) 👦</option>
                    <option value="safe_zones">Tabela: safe_zones (Cercas) 🏠</option>
                    <option value="tasks">Tabela: tasks (Missões) 📚</option>
                    <option value="rewards">Tabela: rewards (Prêmios) 🎁</option>
                  </select>
                </div>
              </div>

              {!isConfigured ? (
                <p className="text-xs text-slate-400 py-6 text-center">Conecte o Supabase para testar o banco de dados e os canais de rádio WebSocket Realtime.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Current database records */}
                  <div className="md:col-span-7 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Registros Atuais na Tabela "{activeTable}"</span>
                      <button
                        onClick={handleSimulateInsert}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg flex items-center gap-1 text-[10px]"
                      >
                        <Plus className="h-3 w-3" /> Inserir Item de Simulação
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 max-h-56 overflow-y-auto space-y-2 text-xs">
                      {dbLoading ? (
                        <p className="text-center text-slate-400 py-6">Carregando dados...</p>
                      ) : dbItems.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 space-y-1.5">
                          <p>Nenhum registro encontrado nesta tabela.</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                            Isso ocorre se as tabelas ainda não foram criadas no seu console do Supabase. Use a aba "Esquema SQL" abaixo para criá-las.
                          </p>
                        </div>
                      ) : (
                        dbItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-start p-2 border border-slate-100 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {item.message || item.name || item.title || item.id}
                              </p>
                              <p className="text-[9px] font-mono text-slate-400 mt-1">
                                {JSON.stringify(item).substring(0, 80)}...
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors self-center shrink-0"
                              title="Deletar registro"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Realtime logs sidepanel */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      <Terminal className="h-3.5 w-3.5 animate-pulse" />
                      Stream Realtime WebSocket Logs
                    </div>

                    <div className="bg-slate-900 text-slate-200 font-mono text-[9px] rounded-xl p-3.5 h-64 overflow-y-auto space-y-2">
                      <span className="text-slate-500">// Ouvindo canal "{activeTable}"...</span>
                      {realtimeLogs.length === 0 ? (
                        <p className="text-slate-500 italic mt-2">Nenhum evento detectado. Insira ou exclua registros na tabela para ver a atualização instantânea aparecer aqui via WebSockets!</p>
                      ) : (
                        realtimeLogs.map((log, index) => (
                          <div key={index} className="border-b border-slate-800 pb-2">
                            <span className="text-emerald-400 font-bold">[{log.timestamp}]</span>{' '}
                            <span className="text-indigo-400 font-bold">{log.event}</span>{' '}
                            <span className="text-amber-400 font-bold">{log.table}</span>
                            <pre className="text-slate-300 mt-1 whitespace-pre-wrap select-all font-mono">
                              {JSON.stringify(log.data, null, 1)}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* SQL SCHEMAS DOCUMENTATION ACCORDION */}
            <div className="mt-6 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-4 w-4" />
                  Instalação e Scripts de Migração (SQL Editor)
                </h4>
                <button
                  onClick={copySQLToClipboard}
                  className="px-2.5 py-1 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-850 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copiar SQL Completo
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Abra o console do seu <strong>Supabase</strong>, clique em <strong>SQL Editor</strong>, 
                crie uma nova consulta ("New Query"), cole o script copiado e clique em <strong>Run</strong>.
              </p>

              <div className="bg-slate-900 text-slate-300 font-mono text-[10px] rounded-xl p-4 overflow-x-auto max-h-48 whitespace-pre text-left">
{`-- Tabelas do Guardião Kids no Supabase

create table safe_zones (
  id text primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius double precision not null,
  is_active boolean default true,
  type text not null
);

create table children (
  id text primary key,
  name text not null,
  avatar text not null,
  latitude double precision not null,
  longitude double precision not null,
  last_seen text not null,
  battery_level integer not null default 100,
  current_safe_zone_id text references safe_zones(id) on delete set null,
  coins integer default 0,
  xp integer default 0
);

create table tasks (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  reward_coins integer not null default 0,
  is_completed boolean default false,
  is_approved boolean default false,
  category text not null,
  due_date text
);

create table rewards (
  id text primary key,
  child_id text references children(id) on delete cascade,
  title text not null,
  description text,
  cost_coins integer not null default 0,
  is_redeemed boolean default false,
  is_approved boolean default false
);

create table alerts (
  id text primary key,
  child_id text references children(id) on delete cascade,
  child_name text not null,
  type text not null,
  message text not null,
  timestamp text not null,
  is_read boolean default false,
  latitude double precision,
  longitude double precision
);

-- Ativar Sincronização em Tempo Real (Realtime WebSockets)
alter publication supabase_realtime add table children;
alter publication supabase_realtime add table safe_zones;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table rewards;
alter publication supabase_realtime add table alerts;`}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
