import { signal, Signal } from '../core/signals';
import { Child, SafeZone, Task, Reward, Alert, AppTheme, UserRole, ActiveTab } from '../domain/entities';
import { calculateDistance, isCoordinateInSafeZone } from '../domain/use-cases';
import { LocalStorageRepository } from './local-storage-repository';
import { supabaseDatabaseService } from '../services/supabaseDatabaseService';
import { isConfigured } from '../services/supabaseClient';

// Web Audio API siren alert controller for Panic SOS
class AlertAudioManager {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;

  start() {
    if (this.intervalId) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let toggle = true;
      this.intervalId = setInterval(() => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(toggle ? 880 : 660, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
        toggle = !toggle;
      }, 600);
    } catch (e) {
      console.warn('Audio Context not allowed or supported by browser policy.', e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

const audioAlertManager = new AlertAudioManager();

// Default seed data
const defaultSafeZones: SafeZone[] = [
  { id: 'sz-1', name: 'Casa', latitude: -23.55052, longitude: -46.633308, radius: 120, isActive: true, type: 'home' },
  { id: 'sz-2', name: 'Escola Guardião', latitude: -23.5535, longitude: -46.6375, radius: 150, isActive: true, type: 'school' },
  { id: 'sz-3', name: 'Parque Ibirapuera', latitude: -23.5482, longitude: -46.6295, radius: 100, isActive: true, type: 'park' },
];

const defaultChildren: Child[] = [
  { id: 'child-1', name: 'Lucas', avatar: '👦', latitude: -23.55052, longitude: -46.633308, lastSeen: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), batteryLevel: 85, currentSafeZoneId: 'sz-1', coins: 140, xp: 480, protectionMode: 'standard' },
  { id: 'child-2', name: 'Júlia', avatar: '👧', latitude: -23.5535, longitude: -46.6375, lastSeen: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), batteryLevel: 42, currentSafeZoneId: 'sz-2', coins: 65, xp: 220, protectionMode: 'standard' },
];

const defaultTasks: Task[] = [
  { id: 'task-1', childId: 'child-1', title: 'Fazer a lição de matemática', description: 'Realizar os exercícios das páginas 32 a 35 da apostila.', rewardCoins: 30, isCompleted: false, isApproved: false, category: 'study' },
  { id: 'task-2', childId: 'child-1', title: 'Escovar os dentes após almoço', description: 'Manter a higiene bucal após se alimentar.', rewardCoins: 10, isCompleted: true, isApproved: true, category: 'hygiene' },
  { id: 'task-3', childId: 'child-2', title: 'Arrumar os brinquedos na gaveta', description: 'Organizar o quarto após brincar com os blocos.', rewardCoins: 20, isCompleted: true, isApproved: false, category: 'chores' },
  { id: 'task-4', childId: 'child-2', title: 'Comer uma fruta de lanche', description: 'Escolher banana, maçã ou uva para o lanche da tarde.', rewardCoins: 15, isCompleted: false, isApproved: false, category: 'health' },
];

const defaultRewards: Reward[] = [
  { id: 'rew-1', childId: 'child-1', title: '1 hora de videogame', description: 'Tempo livre para jogar no console no fim de semana.', costCoins: 50, isRedeemed: true, isApproved: true },
  { id: 'rew-2', childId: 'child-1', title: 'Escolher o jantar de sexta', description: 'Poder escolher a pizzaria ou lanchonete da janta.', costCoins: 80, isRedeemed: false, isApproved: false },
  { id: 'rew-3', childId: 'child-2', title: 'Passeio extra de patinete', description: 'Passeio estendido com os pais no parque.', costCoins: 40, isRedeemed: false, isApproved: false },
  { id: 'rew-4', childId: 'child-2', title: 'Assistir a um filme com pipoca', description: 'Sessão cinema em família em casa.', costCoins: 60, isRedeemed: false, isApproved: false },
];

const defaultAlerts: Alert[] = [
  { id: 'alert-1', childId: 'child-2', childName: 'Júlia', type: 'geofence_enter', message: 'Júlia entrou na cerca de segurança: Escola Guardião', timestamp: '14:20', isRead: true },
  { id: 'alert-2', childId: 'child-1', childName: 'Lucas', type: 'geofence_exit', message: 'Lucas saiu da cerca de segurança: Casa', timestamp: '10:05', isRead: true },
];

// Reactive Core App States (Hydrated from repository adapter)
export const themeSignal = signal<AppTheme>(LocalStorageRepository.get('gkids_theme', 'light'));
export const userRoleSignal = signal<UserRole>(LocalStorageRepository.get('gkids_user_role', null) as UserRole); // Persist profile selection
export const selectedChildIdSignal = signal<string>(LocalStorageRepository.get('gkids_sel_child_id', ''));
export const parentPinSignal = signal<string>(LocalStorageRepository.get('gkids_parent_pin', '1234'));

export function setSelectedChildId(id: string) {
  selectedChildIdSignal.set(id);
  LocalStorageRepository.set('gkids_sel_child_id', id);
}
export const activeTabSignal = signal<ActiveTab>('dashboard');

// Family Pairing & Child-Parent Account Linking Signals
export const familyPairingCodeSignal = signal<string>(LocalStorageRepository.get('gkids_family_code', 'GK-8492'));
export const familyParentEmailSignal = signal<string>(LocalStorageRepository.get('gkids_family_email', 'projetosia27@gmail.com'));
export const familyParentPhoneSignal = signal<string>(LocalStorageRepository.get('gkids_family_phone', '(11) 98765-4321'));
export const isDeviceLinkedSignal = signal<boolean>(LocalStorageRepository.get('gkids_device_linked', false));
export const linkedParentEmailSignal = signal<string>(LocalStorageRepository.get('gkids_linked_parent_email', ''));

import { supabaseAuthService } from '../services/supabaseAuthService';

export async function initializeUserAuthLinking() {
  try {
    const user = await supabaseAuthService.getCurrentUser();
    if (user) {
      // Setup parent data based on the authenticated user
      const userEmail = user.email || 'projetosia27@gmail.com';
      familyParentEmailSignal.set(userEmail);
      LocalStorageRepository.set('gkids_family_email', userEmail);
      
      // Auto generate a pairing code based on email
      const userCode = 'GK-' + (userEmail.length * 100 + userEmail.charCodeAt(0)).toString();
      familyPairingCodeSignal.set(userCode);
      LocalStorageRepository.set('gkids_family_code', userCode);
      
      // Check if user has a linked parent email in metadata
      const linkedEmail = user.user_metadata?.linked_parent_email;
      if (linkedEmail) {
        isDeviceLinkedSignal.set(true);
        linkedParentEmailSignal.set(linkedEmail);
        LocalStorageRepository.set('gkids_device_linked', true);
        LocalStorageRepository.set('gkids_linked_parent_email', linkedEmail);
      }
    }
  } catch (error) {
    console.error('Error initializing user auth linking:', error);
  }
}

export async function linkDeviceWithParent(emailOrPhoneOrCode: string): Promise<{ success: boolean; message: string }> {
  const cleanInput = emailOrPhoneOrCode.trim().toLowerCase();
  const familyCode = familyPairingCodeSignal().toLowerCase();
  const parentEmail = familyParentEmailSignal().toLowerCase();
  const parentPhone = familyParentPhoneSignal().replace(/\D/g, '');
  const cleanInputPhone = cleanInput.replace(/\D/g, '');

  let emailToLink = '';

  if (
    cleanInput === familyCode || 
    cleanInput === parentEmail || 
    (cleanInputPhone.length >= 8 && parentPhone.includes(cleanInputPhone))
  ) {
    emailToLink = familyParentEmailSignal();
  } else if (cleanInputPhone.length >= 8 || cleanInput.length >= 4) {
    // Flexible link for custom phone or code
    emailToLink = cleanInput.includes('@') ? cleanInput : (cleanInputPhone.length >= 8 ? cleanInput : familyParentEmailSignal());
    if (cleanInputPhone.length >= 8) {
      familyParentPhoneSignal.set(cleanInput);
      LocalStorageRepository.set('gkids_family_phone', cleanInput);
    }
  } else {
    return { success: false, message: 'Código ou celular inválido. Digite o celular cadastrado do pai ou o código de pareamento.' };
  }

  isDeviceLinkedSignal.set(true);
  linkedParentEmailSignal.set(emailToLink);
  LocalStorageRepository.set('gkids_device_linked', true);
  LocalStorageRepository.set('gkids_linked_parent_email', emailToLink);

  try {
    // Persist in cloud (Supabase) so it survives cache clears
    await supabaseAuthService.updateUserMetadata({ linked_parent_email: emailToLink });
  } catch (error) {
    console.error('Failed to save link to Supabase metadata', error);
  }

  return { success: true, message: `Vínculo estabelecido com a conta dos pais!` };
}

export async function unlinkDevice() {
  isDeviceLinkedSignal.set(false);
  linkedParentEmailSignal.set('');
  LocalStorageRepository.set('gkids_device_linked', false);
  LocalStorageRepository.set('gkids_linked_parent_email', '');
  
  try {
    await supabaseAuthService.updateUserMetadata({ linked_parent_email: null });
  } catch (error) {
    console.error('Failed to unlink in Supabase metadata', error);
  }
}

export const childrenSignal = signal<Child[]>([]); // Start empty, wait for Supabase
export const safeZonesSignal = signal<SafeZone[]>([]);
export const tasksSignal = signal<Task[]>([]);
export const rewardsSignal = signal<Reward[]>([]);
export const alertsSignal = signal<Alert[]>([]);

export const isPanicActiveSignal = signal<boolean>(false);
export const isSimulationActiveSignal = signal<boolean>(false);
export const syncErrorSignal = signal<string | null>(null);

export async function syncFromSupabase() {
  if (!isConfigured) return;
  try {
    const [children, zones, tasks, rewards, alerts] = await Promise.all([
      supabaseDatabaseService.getChildren(),
      supabaseDatabaseService.getSafeZones(),
      supabaseDatabaseService.getTasks(),
      supabaseDatabaseService.getRewards(),
      supabaseDatabaseService.getAlerts()
    ]);
    
    if (children) childrenSignal.set(children);
    if (zones) safeZonesSignal.set(zones);
    if (tasks) tasksSignal.set(tasks);
    if (rewards) rewardsSignal.set(rewards);
    if (alerts) alertsSignal.set(alerts);
    
    // Auto-select first child if not in list
    const selectedId = selectedChildIdSignal();
    if (children.length > 0 && !children.find(c => c.id === selectedId)) {
      selectedChildIdSignal.set(children[0].id);
    }
    syncErrorSignal.set(null);
  } catch (err: any) {
    console.error('Error syncing from Supabase:', err?.message || err);
    syncErrorSignal.set("Erro ao conectar com o banco de dados. Verifique se você executou o arquivo supabase-setup.sql no SQL Editor do Supabase.");
  }
}

// Automatically sync on module load if we have config
if (isConfigured) {
  syncFromSupabase();
}

// LocalStorage persistence subscribers
themeSignal.subscribe((val) => {
  LocalStorageRepository.set('gkids_theme', val);
  if (val === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
userRoleSignal.subscribe((val) => LocalStorageRepository.set('gkids_user_role', val));
selectedChildIdSignal.subscribe((val) => LocalStorageRepository.set('gkids_sel_child_id', val));
childrenSignal.subscribe((val) => LocalStorageRepository.set('gkids_children', val));
safeZonesSignal.subscribe((val) => LocalStorageRepository.set('gkids_safe_zones', val));
tasksSignal.subscribe((val) => LocalStorageRepository.set('gkids_tasks', val));
rewardsSignal.subscribe((val) => LocalStorageRepository.set('gkids_rewards', val));
alertsSignal.subscribe((val) => LocalStorageRepository.set('gkids_alerts', val));

// BUSINESS RULES / USE CASES TRIGGERS (CORE SYSTEM ACTIONS)

export function toggleTheme() {
  themeSignal.set(themeSignal() === 'light' ? 'dark' : 'light');
}

export function switchUserRole(role: UserRole) {
  userRoleSignal.set(role);
  if (role) {
    LocalStorageRepository.set('gkids_user_role', role);
  } else {
    // If setting to null, remove it from local storage so they can pick again
    localStorage.removeItem('gkids_user_role');
  }
}

export function createChild(name: string, avatar: string, fullChild?: Child) {
  const newChild: Child = fullChild || {
    id: `child-${Date.now()}`,
    name,
    avatar,
    latitude: -23.55052,
    longitude: -46.633308,
    lastSeen: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    batteryLevel: 100,
    currentSafeZoneId: 'sz-1',
    coins: 0,
    xp: 0,
    protectionMode: 'standard',
  };
  childrenSignal.update(prev => [...prev, newChild]);
  return newChild.id;
}

export function updateChild(updatedChild: Child) {
  childrenSignal.update(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
}

export function updateProtectionMode(childId: string, mode: 'standard' | 'shopping' | 'loose_hand' | 'none') {
  childrenSignal.update(prev => prev.map(c => 
    c.id === childId ? { ...c, protectionMode: mode } : c
  ));
}

export function updateChildLocation(childId: string, lat: number, lng: number, forceBatteryChange?: number) {
  childrenSignal.update(prev => {
    return prev.map(child => {
      if (child.id !== childId) return child;

      let currentZoneId: string | null = null;
      const zones = safeZonesSignal();

      for (const zone of zones) {
        if (isCoordinateInSafeZone(lat, lng, zone)) {
          currentZoneId = zone.id;
          break;
        }
      }

      const prevZoneId = child.currentSafeZoneId;
      if (prevZoneId !== currentZoneId) {
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        if (prevZoneId && !currentZoneId) {
          const exitedZone = zones.find(z => z.id === prevZoneId);
          if (exitedZone) {
            triggerAlert({
              id: `alert-${Date.now()}`,
              childId: child.id,
              childName: child.name,
              type: 'geofence_exit',
              message: `🚨 ${child.name} saiu da cerca de segurança: ${exitedZone.name}`,
              timestamp,
              isRead: false,
              latitude: lat,
              longitude: lng,
            });
          }
        } else if (!prevZoneId && currentZoneId) {
          const enteredZone = zones.find(z => z.id === currentZoneId);
          if (enteredZone) {
            triggerAlert({
              id: `alert-${Date.now()}-enter`,
              childId: child.id,
              childName: child.name,
              type: 'geofence_enter',
              message: `✅ ${child.name} entrou com segurança em: ${enteredZone.name}`,
              timestamp,
              isRead: false,
              latitude: lat,
              longitude: lng,
            });
          }
        } else if (prevZoneId && currentZoneId) {
          const exitedZone = zones.find(z => z.id === prevZoneId);
          const enteredZone = zones.find(z => z.id === currentZoneId);
          if (exitedZone && enteredZone) {
            triggerAlert({
              id: `alert-${Date.now()}-switch`,
              childId: child.id,
              childName: child.name,
              type: 'geofence_exit',
              message: `ℹ️ ${child.name} mudou de local: saiu de ${exitedZone.name} e foi para ${enteredZone.name}`,
              timestamp,
              isRead: false,
              latitude: lat,
              longitude: lng,
            });
          }
        }
      }

      const currentBattery = forceBatteryChange !== undefined ? forceBatteryChange : child.batteryLevel;
      if (currentBattery < 20 && child.batteryLevel >= 20) {
        triggerAlert({
          id: `alert-bat-${Date.now()}`,
          childId: child.id,
          childName: child.name,
          type: 'battery_low',
          message: `🔋 Bateria Fraca: O dispositivo de ${child.name} está com ${currentBattery}%!`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        });
      }

      return {
        ...child,
        latitude: lat,
        longitude: lng,
        lastSeen: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        currentSafeZoneId: currentZoneId,
        batteryLevel: currentBattery,
      };
    });
  });
}

export function triggerAlert(newAlert: Alert) {
  alertsSignal.update(prev => [newAlert, ...prev]);
  if (newAlert.type === 'panic') {
    isPanicActiveSignal.set(true);
    audioAlertManager.start();
  }
}

export function clearSOS() {
  isPanicActiveSignal.set(false);
  audioAlertManager.stop();
}

export function markAlertsAsRead() {
  alertsSignal.update(prev => prev.map(a => ({ ...a, isRead: true })));
}

export function deleteAlert(id: string) {
  alertsSignal.update(prev => prev.filter(a => a.id !== id));
}

export function addSafeZone(name: string, lat: number, lng: number, radius: number, type: 'home' | 'school' | 'park' | 'custom') {
  const newZone: SafeZone = {
    id: `sz-${Date.now()}`,
    name,
    latitude: lat,
    longitude: lng,
    radius,
    isActive: true,
    type,
  };
  safeZonesSignal.update(prev => [...prev, newZone]);
  
  childrenSignal().forEach(child => {
    updateChildLocation(child.id, child.latitude, child.longitude);
  });
}

export function deleteSafeZone(id: string) {
  safeZonesSignal.update(prev => prev.filter(z => z.id !== id));
  childrenSignal().forEach(child => {
    updateChildLocation(child.id, child.latitude, child.longitude);
  });
}

export function toggleSafeZoneActive(id: string) {
  safeZonesSignal.update(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  childrenSignal().forEach(child => {
    updateChildLocation(child.id, child.latitude, child.longitude);
  });
}

export function createTask(childId: string, title: string, description: string, coins: number, category: 'study' | 'hygiene' | 'chores' | 'health') {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    childId,
    title,
    description,
    rewardCoins: coins,
    isCompleted: false,
    isApproved: false,
    category,
  };
  tasksSignal.update(prev => [...prev, newTask]);
}

export function deleteTask(id: string) {
  tasksSignal.update(prev => prev.filter(t => t.id !== id));
}

export function completeTask(taskId: string) {
  tasksSignal.update(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t));
}

export function approveTask(taskId: string) {
  let taskAward: { childId: string; coins: number } | null = null;
  
  tasksSignal.update(prev => prev.map(t => {
    if (t.id === taskId) {
      taskAward = { childId: t.childId, coins: t.rewardCoins };
      return { ...t, isApproved: true };
    }
    return t;
  }));

  if (taskAward) {
    const award = taskAward;
    childrenSignal.update(prev => prev.map(child => {
      if (child.id === award.childId) {
        return {
          ...child,
          coins: child.coins + award.coins,
          xp: child.xp + (award.coins * 3),
        };
      }
      return child;
    }));
  }
}

export function createReward(childId: string, title: string, description: string, cost: number) {
  const newReward: Reward = {
    id: `rew-${Date.now()}`,
    childId,
    title,
    description,
    costCoins: cost,
    isRedeemed: false,
    isApproved: false,
  };
  rewardsSignal.update(prev => [...prev, newReward]);
}

export function deleteReward(id: string) {
  rewardsSignal.update(prev => prev.filter(r => r.id !== id));
}

export function redeemReward(rewardId: string): { success: boolean; error?: string } {
  const reward = rewardsSignal().find(r => r.id === rewardId);
  if (!reward) return { success: false, error: 'Recompensa não encontrada' };

  const child = childrenSignal().find(c => c.id === reward.childId);
  if (!child) return { success: false, error: 'Filho não encontrado' };

  if (child.coins < reward.costCoins) {
    return { success: false, error: 'Moedas insuficientes!' };
  }

  childrenSignal.update(prev => prev.map(c => c.id === child.id ? { ...c, coins: c.coins - reward.costCoins } : c));
  rewardsSignal.update(prev => prev.map(r => r.id === rewardId ? { ...r, isRedeemed: true } : r));

  return { success: true };
}

export function approveRewardClaim(rewardId: string) {
  rewardsSignal.update(prev => prev.map(r => r.id === rewardId ? { ...r, isApproved: true } : r));
}

export function triggerSOS(childId: string) {
  const child = childrenSignal().find(c => c.id === childId);
  if (!child) return;

  const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  triggerAlert({
    id: `sos-${Date.now()}`,
    childId,
    childName: child.name,
    type: 'panic',
    message: `🚨 ALERTA DE PÂNICO: ${child.name} ativou o SOS de emergência!`,
    timestamp,
    isRead: false,
    latitude: child.latitude,
    longitude: child.longitude,
  });
}

// Simulated GPS walking engine
let simulationInterval: any = null;
let simAngle = 0;

export function toggleSimulation() {
  const isActive = isSimulationActiveSignal();
  if (isActive) {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    isSimulationActiveSignal.set(false);
  } else {
    isSimulationActiveSignal.set(true);
    const childId = selectedChildIdSignal();
    const targetChild = childrenSignal().find(c => c.id === childId);
    if (!targetChild) return;

    const baseLat = targetChild.latitude;
    const baseLng = targetChild.longitude;

    simulationInterval = setInterval(() => {
      simAngle += 0.08;
      const offsetLat = Math.sin(simAngle) * 0.0035;
      const offsetLng = Math.cos(simAngle * 0.5) * 0.0035;

      const newLat = baseLat + offsetLat;
      const newLng = baseLng + offsetLng;

      const randomBatChance = Math.random();
      const currentChild = childrenSignal().find(c => c.id === childId);
      let newBat = currentChild ? currentChild.batteryLevel : 100;
      if (randomBatChance > 0.8) {
        newBat = Math.max(12, newBat - 1);
      }

      updateChildLocation(childId, newLat, newLng, newBat);
    }, 3000);
  }
}
