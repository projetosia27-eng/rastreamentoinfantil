import { supabase } from './supabaseClient';
import { Child, SafeZone, Task, Reward, Alert } from '../domain/entities';

/**
 * SQL Schema for easy deployment in Supabase SQL Editor:
 * 
 * -- 1. Safe Zones
 * create table safe_zones (
 *   id text primary key,
 *   name text not null,
 *   latitude double precision not null,
 *   longitude double precision not null,
 *   radius double precision not null,
 *   is_active boolean default true,
 *   type text not null
 * );
 * 
 * -- 2. Children
 * create table children (
 *   id text primary key,
 *   name text not null,
 *   avatar text not null,
 *   latitude double precision not null,
 *   longitude double precision not null,
 *   last_seen text not null,
 *   battery_level integer not null default 100,
 *   current_safe_zone_id text references safe_zones(id) on delete set null,
 *   coins integer default 0,
 *   xp integer default 0
 * );
 * 
 * -- 3. Tasks
 * create table tasks (
 *   id text primary key,
 *   child_id text references children(id) on delete cascade,
 *   title text not null,
 *   description text,
 *   reward_coins integer not null default 0,
 *   is_completed boolean default false,
 *   is_approved boolean default false,
 *   category text not null,
 *   due_date text
 * );
 * 
 * -- 4. Rewards
 * create table rewards (
 *   id text primary key,
 *   child_id text references children(id) on delete cascade,
 *   title text not null,
 *   description text,
 *   cost_coins integer not null default 0,
 *   is_redeemed boolean default false,
 *   is_approved boolean default false
 * );
 * 
 * -- 5. Alerts
 * create table alerts (
 *   id text primary key,
 *   child_id text references children(id) on delete cascade,
 *   child_name text not null,
 *   type text not null,
 *   message text not null,
 *   timestamp text not null,
 *   is_read boolean default false,
 *   latitude double precision,
 *   longitude double precision
 * );
 */

export const supabaseDatabaseService = {
  // --- MAPPING UTILITIES ---
  mapChildToDB: (child: Child) => ({
    id: child.id,
    name: child.name,
    avatar: child.avatar,
    latitude: child.latitude,
    longitude: child.longitude,
    last_seen: child.lastSeen,
    battery_level: child.batteryLevel,
    current_safe_zone_id: child.currentSafeZoneId,
    coins: child.coins,
    xp: child.xp,
    protection_mode: child.protectionMode || 'standard',
    birth_date: child.birthDate,
    characteristics: child.characteristics,
    emergency_contact: child.emergencyContact,
    phone: child.phone,
  }),

  mapChildFromDB: (db: any): Child => ({
    id: db.id,
    name: db.name,
    avatar: db.avatar,
    latitude: db.latitude,
    longitude: db.longitude,
    lastSeen: db.last_seen,
    batteryLevel: db.battery_level,
    currentSafeZoneId: db.current_safe_zone_id,
    coins: db.coins,
    xp: db.xp,
    protectionMode: db.protection_mode || 'standard',
    birthDate: db.birth_date,
    characteristics: db.characteristics,
    emergencyContact: db.emergency_contact,
    phone: db.phone,
  }),

  mapSafeZoneToDB: (zone: SafeZone) => ({
    id: zone.id,
    name: zone.name,
    latitude: zone.latitude,
    longitude: zone.longitude,
    radius: zone.radius,
    is_active: zone.isActive,
    type: zone.type,
  }),

  mapSafeZoneFromDB: (db: any): SafeZone => ({
    id: db.id,
    name: db.name,
    latitude: db.latitude,
    longitude: db.longitude,
    radius: db.radius,
    isActive: db.is_active,
    type: db.type as any,
  }),

  mapTaskToDB: (task: Task) => ({
    id: task.id,
    child_id: task.childId,
    title: task.title,
    description: task.description,
    reward_coins: task.rewardCoins,
    is_completed: task.isCompleted,
    is_approved: task.isApproved,
    category: task.category,
    due_date: task.dueDate || null,
  }),

  mapTaskFromDB: (db: any): Task => ({
    id: db.id,
    childId: db.child_id,
    title: db.title,
    description: db.description,
    rewardCoins: db.reward_coins,
    isCompleted: db.is_completed,
    isApproved: db.is_approved,
    category: db.category as any,
    dueDate: db.due_date || undefined,
  }),

  mapRewardToDB: (reward: Reward) => ({
    id: reward.id,
    child_id: reward.childId,
    title: reward.title,
    description: reward.description,
    cost_coins: reward.costCoins,
    is_redeemed: reward.isRedeemed,
    is_approved: reward.isApproved,
  }),

  mapRewardFromDB: (db: any): Reward => ({
    id: db.id,
    childId: db.child_id,
    title: db.title,
    description: db.description,
    costCoins: db.cost_coins,
    isRedeemed: db.is_redeemed,
    isApproved: db.is_approved,
  }),

  mapAlertToDB: (alert: Alert) => ({
    id: alert.id,
    child_id: alert.childId,
    child_name: alert.childName,
    type: alert.type,
    message: alert.message,
    timestamp: alert.timestamp,
    is_read: alert.isRead,
    latitude: alert.latitude || null,
    longitude: alert.longitude || null,
  }),

  mapAlertFromDB: (db: any): Alert => ({
    id: db.id,
    childId: db.child_id,
    childName: db.child_name,
    type: db.type,
    message: db.message,
    timestamp: db.timestamp,
    isRead: db.is_read,
    latitude: db.latitude || undefined,
    longitude: db.longitude || undefined,
  }),

  // --- CHILDREN OPERATIONS ---
  getChildren: async (): Promise<Child[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('children').select('*');
    if (error) throw error;
    return (data || []).map(supabaseDatabaseService.mapChildFromDB);
  },

  upsertChild: async (child: Child): Promise<void> => {
    if (!supabase) return;
    const dbChild = supabaseDatabaseService.mapChildToDB(child);
    const { error } = await supabase.from('children').upsert(dbChild);
    if (error) throw error;
  },

  deleteChild: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SAFE ZONE OPERATIONS ---
  getSafeZones: async (): Promise<SafeZone[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('safe_zones').select('*');
    if (error) throw error;
    return (data || []).map(supabaseDatabaseService.mapSafeZoneFromDB);
  },

  upsertSafeZone: async (zone: SafeZone): Promise<void> => {
    if (!supabase) return;
    const dbZone = supabaseDatabaseService.mapSafeZoneToDB(zone);
    const { error } = await supabase.from('safe_zones').upsert(dbZone);
    if (error) throw error;
  },

  deleteSafeZone: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('safe_zones').delete().eq('id', id);
    if (error) throw error;
  },

  // --- TASKS OPERATIONS ---
  getTasks: async (): Promise<Task[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return (data || []).map(supabaseDatabaseService.mapTaskFromDB);
  },

  upsertTask: async (task: Task): Promise<void> => {
    if (!supabase) return;
    const dbTask = supabaseDatabaseService.mapTaskToDB(task);
    const { error } = await supabase.from('tasks').upsert(dbTask);
    if (error) throw error;
  },

  deleteTask: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // --- REWARDS OPERATIONS ---
  getRewards: async (): Promise<Reward[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('rewards').select('*');
    if (error) throw error;
    return (data || []).map(supabaseDatabaseService.mapRewardFromDB);
  },

  upsertReward: async (reward: Reward): Promise<void> => {
    if (!supabase) return;
    const dbReward = supabaseDatabaseService.mapRewardToDB(reward);
    const { error } = await supabase.from('rewards').upsert(dbReward);
    if (error) throw error;
  },

  deleteReward: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('rewards').delete().eq('id', id);
    if (error) throw error;
  },

  // --- ALERTS OPERATIONS ---
  getAlerts: async (): Promise<Alert[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return (data || []).map(supabaseDatabaseService.mapAlertFromDB);
  },

  upsertAlert: async (alert: Alert): Promise<void> => {
    if (!supabase) return;
    const dbAlert = supabaseDatabaseService.mapAlertToDB(alert);
    const { error } = await supabase.from('alerts').upsert(dbAlert);
    if (error) throw error;
  },

  deleteAlert: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) throw error;
  },

  clearAllAlerts: async (): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('alerts').delete().not('id', 'is', null);
    if (error) throw error;
  },

  markAlertsAsRead: async (): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('alerts').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  }
};
