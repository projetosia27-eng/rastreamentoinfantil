import { Child, SafeZone, Alert } from './entities';

/**
 * Enterprise Use Case: Calculate distance in meters between two GPS coordinates
 * Uses the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Enterprise Use Case: Determine if a coordinate is inside a safe zone
 */
export function isCoordinateInSafeZone(lat: number, lng: number, zone: SafeZone): boolean {
  if (!zone.isActive) return false;
  const distance = calculateDistance(lat, lng, zone.latitude, zone.longitude);
  return distance <= zone.radius;
}

/**
 * Enterprise Use Case: Compute child Level and remaining progress from XP points
 */
export function calculateChildLevel(xp: number): { level: number; currentXp: number; percentage: number } {
  const XP_PER_LEVEL = 200;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentXp = xp % XP_PER_LEVEL;
  const percentage = Math.min(100, (currentXp / XP_PER_LEVEL) * 100);
  return { level, currentXp, percentage };
}
