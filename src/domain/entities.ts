export type ProtectionMode = 'standard' | 'shopping' | 'loose_hand' | 'none';

export type DeviceType = 'smartphone' | 'smartwatch' | 'tag_bluetooth' | 'pendant';

export interface Child {
  id: string;
  name: string;
  avatar: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  batteryLevel: number;
  currentSafeZoneId: string | null;
  coins: number;
  xp: number;
  protectionMode: ProtectionMode;
  birthDate?: string;
  characteristics?: string;
  emergencyContact?: string;
  deviceType?: DeviceType;
}

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
  type: 'home' | 'school' | 'park' | 'custom';
}

export interface Task {
  id: string;
  childId: string;
  title: string;
  description: string;
  rewardCoins: number;
  isCompleted: boolean;
  isApproved: boolean; // Approved by parent
  category: 'health' | 'study' | 'chores' | 'hygiene';
  dueDate?: string;
}

export interface Reward {
  id: string;
  childId: string;
  title: string;
  description: string;
  costCoins: number;
  isRedeemed: boolean;
  isApproved: boolean; // Approved by parent to claim
}

export interface Alert {
  id: string;
  childId: string;
  childName: string;
  type: 'panic' | 'geofence_exit' | 'geofence_enter' | 'battery_low';
  message: string;
  timestamp: string;
  isRead: boolean;
  latitude?: number;
  longitude?: number;
}

export type AppTheme = 'light' | 'dark';
export type UserRole = 'parent' | 'child' | null;
export type ActiveTab = 'dashboard' | 'map' | 'tasks' | 'rewards' | 'alerts' | 'protection' | 'community' | 'supabase';
