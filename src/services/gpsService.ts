import { useEffect, useState } from 'react';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source?: 'device' | 'ip' | 'fallback';
  city?: string;
  error?: string;
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
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      fetchIPLocation().then((ipLoc) => {
        resolve(ipLoc || {
          latitude: -23.55052,
          longitude: -46.633308,
          accuracy: 50,
          timestamp: Date.now(),
          source: 'fallback'
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
          source: 'device'
        });
      },
      async () => {
        const ipLoc = await fetchIPLocation();
        resolve(ipLoc || {
          latitude: -23.55052,
          longitude: -46.633308,
          accuracy: 100,
          timestamp: Date.now(),
          source: 'fallback'
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

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            source: 'device'
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return { location, isLocating, errorMsg, refreshGPS: requestGPS };
}

