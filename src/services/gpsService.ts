import { useEffect, useState } from 'react';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source?: 'device' | 'ip' | 'fallback';
  city?: string;
  error?: string;
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface BatteryInfo {
  level: number;
  isCharging: boolean;
}

export async function getDeviceBattery(): Promise<BatteryInfo | undefined> {
  try {
    if ('getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      if (battery && typeof battery.level === 'number') {
        return {
          level: Math.round(battery.level * 100),
          isCharging: !!battery.charging,
        };
      }
    }
  } catch (e) {
    // Battery API not supported or restricted
  }
  return undefined;
}

// Fetch IP geolocation as a fallback if HTML5 Geolocation is unavailable/restricted in iframe
export async function fetchIPLocation(): Promise<GPSLocation | null> {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          latitude: lat,
          longitude: lng,
          accuracy: 1000,
          timestamp: Date.now(),
          source: 'ip',
          city: data.city || data.region || 'Sua Região',
        };
      }
    }
  } catch (e) {
    console.warn('IP location fetch fallback error:', e);
  }
  return null;
}

export function getAccuratePosition(): Promise<GPSLocation> {
  return new Promise(async (resolve) => {
    const batInfo = await getDeviceBattery();
    if (!("geolocation" in navigator)) {
      fetchIPLocation().then((ipLoc) => {
        resolve(ipLoc ? { ...ipLoc, batteryLevel: batInfo?.level, isCharging: batInfo?.isCharging } : {
          latitude: -23.55052,
          longitude: -46.633308,
          accuracy: 50,
          timestamp: Date.now(),
          source: 'fallback',
          batteryLevel: batInfo?.level,
          isCharging: batInfo?.isCharging
        });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: 'device',
          batteryLevel: batInfo?.level,
          isCharging: batInfo?.isCharging
        });
      },
      async () => {
        const ipLoc = await fetchIPLocation();
        resolve(ipLoc ? { ...ipLoc, batteryLevel: batInfo?.level, isCharging: batInfo?.isCharging } : {
          latitude: -23.55052,
          longitude: -46.633308,
          accuracy: 100,
          timestamp: Date.now(),
          source: 'fallback',
          batteryLevel: batInfo?.level,
          isCharging: batInfo?.isCharging
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}

export function useDeviceGPS() {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestGPS = async () => {
    setIsLocating(true);
    setErrorMsg(null);

    const pos = await getAccuratePosition();
    setLocation(pos);
    setIsLocating(false);
  };

  useEffect(() => {
    requestGPS();

    let watchId: number | undefined;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const batInfo = await getDeviceBattery();
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            source: 'device',
            batteryLevel: batInfo?.level,
            isCharging: batInfo?.isCharging,
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    }

    // Real-time battery status listener
    let batObj: any = null;
    const handleBatEvent = () => {
      if (batObj && typeof batObj.level === 'number') {
        const lvl = Math.round(batObj.level * 100);
        const charging = !!batObj.charging;
        setLocation(prev => prev ? { ...prev, batteryLevel: lvl, isCharging: charging } : prev);
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        batObj = bat;
        bat.addEventListener('levelchange', handleBatEvent);
        bat.addEventListener('chargingchange', handleBatEvent);
      }).catch(() => {});
    }

    return () => {
      if (watchId !== undefined && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (batObj) {
        batObj.removeEventListener('levelchange', handleBatEvent);
        batObj.removeEventListener('chargingchange', handleBatEvent);
      }
    };
  }, []);

  return { location, isLocating, errorMsg, refreshGPS: requestGPS };
}

