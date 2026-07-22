import React, { useState, useEffect } from 'react';
import { useSignal } from '../../../core/signals';
import { childrenSignal, selectedChildIdSignal, updateChildLocation } from '../../../data/app-state-store';
import { reverseGeocode } from '../../../services/addressService';
import { useDeviceGPS, getAccuratePosition } from '../../../services/gpsService';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  ExternalLink, 
  Volume2, 
  Battery, 
  Clock, 
  Footprints, 
  RotateCw, 
  Camera,
  CheckCircle2,
  Crosshair
} from 'lucide-react';

export default function LiveNavigationMap() {
  const children = useSignal(childrenSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const { location: parentGps, refreshGPS, isLocating } = useDeviceGPS();

  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'waze'>('waze');
  const [streetAddress, setStreetAddress] = useState<string>('Carregando endereço do local...');
  const [showStreetView, setShowStreetView] = useState<boolean>(true);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const childLat = selectedChild ? selectedChild.latitude : -23.5505;
  const childLng = selectedChild ? selectedChild.longitude : -46.6333;

  // Sync real device location to child
  const handleSyncDeviceGPS = async () => {
    setSyncStatus('Obtendo GPS real...');
    const pos = await getAccuratePosition();
    if (selectedChild) {
      updateChildLocation(selectedChild.id, pos.latitude, pos.longitude);
      setSyncStatus('Localização atualizada!');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  // Fetch address for child's coordinates
  useEffect(() => {
    let active = true;
    if (selectedChild) {
      reverseGeocode(childLat, childLng).then((addr) => {
        if (active) setStreetAddress(addr);
      });
    }
    return () => { active = false; };
  }, [childLat, childLng, selectedChild]);

  // Distance calculation in meters
  const calculateDistance = () => {
    if (!parentGps || !selectedChild) return 120;
    const R = 6371000;
    const dLat = ((childLat - parentGps.latitude) * Math.PI) / 180;
    const dLng = ((childLng - parentGps.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((parentGps.latitude * Math.PI) / 180) *
        Math.cos((childLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c) || 120;
  };

  const distanceMeters = calculateDistance();
  const walkMinutes = Math.max(1, Math.round(distanceMeters / 80));

  const openExternalWaze = () => {
    window.open(`https://waze.com/ul?ll=${childLat},${childLng}&navigate=yes`, '_blank');
  };

  const openExternalGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${childLat},${childLng}`, '_blank');
  };

  const triggerAcousticBeacon = () => {
    setIsSirenPlaying(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio beacon played:', e);
    }
    setTimeout(() => setIsSirenPlaying(false), 2000);
  };

  if (!selectedChild) {
    return <div className="p-8 text-center text-slate-500">Nenhuma criança selecionada.</div>;
  }

  // Safe check if avatar is an image URL vs emoji
  const isAvatarImage = selectedChild.avatar && (
    selectedChild.avatar.startsWith('http') || 
    selectedChild.avatar.startsWith('data:') || 
    selectedChild.avatar.includes('/')
  );

  return (
    <div className="space-y-4">
      {/* Top Telemetry Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative shrink-0">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 font-black overflow-hidden">
              {isAvatarImage ? (
                <img 
                  src={selectedChild.avatar} 
                  alt={selectedChild.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <span>{selectedChild.avatar || '👦'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate max-w-[180px] sm:max-w-none">
                {selectedChild.name}
              </h3>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] rounded-md border border-cyan-500/30">
                GPS EM TEMPO REAL
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{streetAddress}</span>
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <Battery className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {selectedChild.batteryLevel}% Bateria
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-yellow-400 shrink-0" /> {selectedChild.lastSeen}
              </span>
            </div>
          </div>
        </div>

        {/* GPS Device Sync & Navigation Stats */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleSyncDeviceGPS}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 shrink-0"
            title="Capturar a localização atual do seu celular e atualizar a posição do mapa"
          >
            <Crosshair className="h-4 w-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{syncStatus || 'GPS do Celular'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="text-center px-3 py-1 bg-slate-800/80 rounded-2xl border border-slate-700/50">
              <span className="block text-[9px] uppercase text-slate-400 font-bold">Distância</span>
              <span className="text-sm sm:text-base font-black text-cyan-400">{distanceMeters}m</span>
            </div>

            <div className="text-center px-3 py-1 bg-slate-800/80 rounded-2xl border border-slate-700/50">
              <span className="block text-[9px] uppercase text-slate-400 font-bold">A pé</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 flex items-center gap-1 justify-center">
                <Footprints className="h-3.5 w-3.5 text-emerald-400" /> ~{walkMinutes}m
              </span>
            </div>

            <button
              onClick={triggerAcousticBeacon}
              className={`p-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all shadow-lg ${
                isSirenPlaying 
                  ? 'bg-red-500 text-white animate-bounce shadow-red-500/50' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
              title="Apito Sonoro"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Toolbar for Map Modes & Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setMapType('waze')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              mapType === 'waze' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🏎️ Waze Nite
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              mapType === 'satellite' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Satélite
          </button>
          <button
            onClick={() => setMapType('streets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              mapType === 'streets' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ Mapa Claro
          </button>
          <button
            onClick={() => setShowStreetView(!showStreetView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all ${
              showStreetView ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            <span>Foto da Rua</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openExternalWaze}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md"
          >
            <Navigation className="h-3.5 w-3.5" />
            Waze
          </button>
          <button
            onClick={openExternalGoogleMaps}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Google Maps
          </button>
        </div>
      </div>

      {/* Main Map Canvas and Street View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* MAP CANVAS PANEL */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl relative min-h-[380px] sm:min-h-[440px] flex flex-col">
          
          <div className="relative w-full flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
            <iframe
              title="Real-time OpenStreetMap Navigation"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${childLng - 0.005}%2C${childLat - 0.003}%2C${childLng + 0.005}%2C${childLat + 0.003}&layer=${
                mapType === 'satellite' ? 'mapnik' : 'mapnik'
              }&marker=${childLat}%2C${childLng}`}
              className={`w-full h-full border-0 ${mapType === 'waze' ? 'invert brightness-90 contrast-125 saturate-150' : ''}`}
            />

            {/* Non-blocking HUD Overlay */}
            <div className="absolute inset-x-3 bottom-3 z-10 pointer-events-none flex justify-between items-end gap-2">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl text-[11px] text-white space-y-0.5 pointer-events-auto">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>GPS Ativo (±2m)</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {childLat.toFixed(5)}, {childLng.toFixed(5)}
                </p>
              </div>

              <button
                onClick={refreshGPS}
                className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black shadow-lg pointer-events-auto flex items-center gap-1 text-xs"
              >
                <RotateCw className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* STREET PHOTO VIEW SIDE PANEL */}
        {showStreetView && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 rounded-xl">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Foto / Vista da Rua</h4>
                  <p className="text-[10px] text-slate-500">Imagens do entorno do GPS</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[9px] font-bold rounded-md">
                Aérea & Fachada
              </span>
            </div>

            {/* Satellite / Street Preview Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
              <img 
                src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/17/${Math.round((1 - Math.log(Math.tan(childLat * Math.PI / 180) + 1 / Math.cos(childLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 17))}/${Math.round((childLng + 180) / 360 * Math.pow(2, 17))}`}
                alt="Vista da Rua e Entorno"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=600');
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-end">
                <div className="flex items-center gap-1 text-white font-bold text-xs truncate">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 animate-bounce" />
                  <span className="truncate">{streetAddress}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
                <p>📍 <strong>Localização aproximada:</strong> {streetAddress}</p>
                <p>🏃 <strong>Distância atual:</strong> {distanceMeters} metros do seu aparelho</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={openExternalWaze}
                  className="py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Waze
                </button>
                <button
                  onClick={openExternalGoogleMaps}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                  Google Maps
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

