import React, { useState, useRef } from 'react';
import { useSignal } from '../../../core/signals';
import { childrenSignal, safeZonesSignal, addSafeZone, updateChildLocation, selectedChildIdSignal } from '../../../data/app-state-store';
import { SafeZone, Child } from '../../../domain/entities';
import { Plus, Check, MapPin, X, ShieldAlert, Navigation } from 'lucide-react';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 500;

// Coordinates boundaries representing central São Paulo for simulation
const MIN_LAT = -23.562;
const MAX_LAT = -23.540;
const MIN_LNG = -46.645;
const MAX_LNG = -46.621;

export default function InteractiveMap() {
  const children = useSignal(childrenSignal);
  const safeZones = useSignal(safeZonesSignal);
  const selectedChildId = useSignal(selectedChildIdSignal);

  const [clickPos, setClickPos] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(150);
  const [newZoneType, setNewZoneType] = useState<'home' | 'school' | 'park' | 'custom'>('custom');

  const svgRef = useRef<SVGSVGElement>(null);

  // Convert GPS Coordinates to SVG X,Y
  function getXY(lat: number, lng: number) {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_WIDTH;
    const y = MAP_HEIGHT - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
    return { x, y };
  }

  // Convert SVG X,Y to GPS Coordinates
  function getLatLng(x: number, y: number) {
    const lng = MIN_LNG + (x / MAP_WIDTH) * (MAX_LNG - MIN_LNG);
    const lat = MIN_LAT + ((MAP_HEIGHT - y) / MAP_HEIGHT) * (MAX_LAT - MIN_LAT);
    return { lat, lng };
  }

  // Calculate pixel radius from meter radius
  function getPixelRadius(meterRadius: number) {
    return meterRadius * 0.28; 
  }

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;
    
    const { lat, lng } = getLatLng(x, y);
    setClickPos({ x, y, lat, lng });
  };

  const handleCreateZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickPos || !newZoneName.trim()) return;

    addSafeZone(
      newZoneName,
      clickPos.lat,
      clickPos.lng,
      newZoneRadius,
      newZoneType
    );

    setShowCreateModal(false);
    setClickPos(null);
    setNewZoneName('');
  };

  const teleportChild = (childId: string) => {
    if (!clickPos) return;
    updateChildLocation(childId, clickPos.lat, clickPos.lng);
    setClickPos(null);
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm animate-in fade-in duration-300" id="interactive-map-container">
      {/* Map Header Instructions */}
      <div className="absolute top-4 left-4 z-10 max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
          <Navigation className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
          Rastreamento de Localização Ativo
        </h4>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          Clique no mapa para <strong>teleportar</strong> a criança ou <strong>desenhar uma nova cerca virtual</strong>.
        </p>
      </div>

      {/* SVG Canvas Map */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-auto cursor-crosshair select-none bg-[#e8f0fe] dark:bg-[#121826] transition-colors duration-300"
        onClick={handleMapClick}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200/50 dark:text-slate-800/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Rivers / Water Bodies */}
        <path
          d="M -20,100 C 150,120 300,50 450,150 C 600,250 700,320 850,340"
          fill="none"
          stroke="#acd0ff"
          strokeWidth="32"
          strokeLinecap="round"
          className="dark:stroke-[#1d324f] opacity-70"
        />
        <path
          d="M -20,100 C 150,120 300,50 450,150 C 600,250 700,320 850,340"
          fill="none"
          stroke="#bce0ff"
          strokeWidth="24"
          strokeLinecap="round"
          className="dark:stroke-[#203a5c]"
        />

        {/* Roads & Streets (Decorative neighborhood grid) */}
        <g stroke="currentColor" className="text-white dark:text-[#1d273d] stroke-[12] fill-none opacity-90 stroke-round">
          <line x1="-50" y1="220" x2="850" y2="220" />
          <line x1="380" y1="-50" x2="380" y2="550" />
          <line x1="-50" y1="80" x2="850" y2="80" strokeWidth="6" />
          <line x1="-50" y1="380" x2="850" y2="380" strokeWidth="6" />
          <line x1="160" y1="-50" x2="160" y2="550" strokeWidth="6" />
          <line x1="620" y1="-50" x2="620" y2="550" strokeWidth="6" strokeDasharray="15, 10" />
        </g>

        {/* Inner lines of streets to look styled */}
        <g stroke="currentColor" className="text-slate-100 dark:text-[#0c101a] stroke-[2] fill-none opacity-50">
          <line x1="-50" y1="220" x2="850" y2="220" />
          <line x1="380" y1="-50" x2="380" y2="550" />
        </g>

        {/* Park Greenery Spaces */}
        <rect x="50" y="20" width="180" height="120" rx="20" fill="#daf2d5" className="dark:fill-[#1b2f1c] opacity-60" />
        <text x="140" y="80" textAnchor="middle" className="fill-[#529342] dark:fill-[#4d8f3e] text-[10px] font-semibold">Área Verde</text>
        
        <rect x="430" y="300" width="220" height="160" rx="30" fill="#daf2d5" className="dark:fill-[#1b2f1c] opacity-60" />
        <text x="540" y="380" textAnchor="middle" className="fill-[#529342] dark:fill-[#4d8f3e] text-[11px] font-bold">Pq. Ibirapuera</text>

        {/* Safe Zones (Cercas Virtuais) circles and labels */}
        {safeZones.map((zone) => {
          if (!zone.isActive) return null;
          const { x, y } = getXY(zone.latitude, zone.longitude);
          const r = getPixelRadius(zone.radius);
          
          let colorClass = 'stroke-green-500 fill-green-500/10 dark:fill-green-500/5';
          let borderDash = '';
          if (zone.type === 'school') {
            colorClass = 'stroke-indigo-500 fill-indigo-500/10 dark:fill-indigo-500/5';
          } else if (zone.type === 'park') {
            colorClass = 'stroke-emerald-500 fill-emerald-500/10 dark:fill-emerald-500/5';
          } else if (zone.type === 'custom') {
            colorClass = 'stroke-amber-500 fill-amber-500/10 dark:fill-amber-500/5';
            borderDash = '8, 4';
          }

          return (
            <g key={zone.id} className="transition-all duration-500">
              <circle
                cx={x}
                cy={y}
                r={r}
                className={`${colorClass} stroke-[1.5]`}
                strokeDasharray={borderDash}
              />
              <circle
                cx={x}
                cy={y}
                r={r + 6}
                fill="none"
                className="stroke-green-500/20 dark:stroke-green-500/10 stroke-[1] animate-ping"
                style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '4s' }}
              />
              <circle cx={x} cy={y} r="4" className="fill-slate-800 dark:fill-slate-200" />
              <text
                x={x}
                y={y - r - 8}
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 font-bold text-[10px] bg-white/80 dark:bg-slate-900/80 px-1 rounded backdrop-blur-sm shadow-xs"
              >
                🛡️ {zone.name}
              </text>
            </g>
          );
        })}

        {/* Click Position temporary crosshair marker */}
        {clickPos && (
          <g>
            <circle cx={clickPos.x} cy={clickPos.y} r="6" className="fill-none stroke-blue-500 stroke-2 animate-pulse" />
            <line x1={clickPos.x - 12} y1={clickPos.y} x2={clickPos.x + 12} y2={clickPos.y} className="stroke-blue-500 stroke-1" />
            <line x1={clickPos.x} y1={clickPos.y - 12} x2={clickPos.x} y2={clickPos.y + 12} className="stroke-blue-500 stroke-1" />
          </g>
        )}

        {/* Kids Markers */}
        {children.map((child) => {
          const { x, y } = getXY(child.latitude, child.longitude);
          const isSelected = child.id === selectedChildId;

          return (
            <g key={child.id} className="cursor-pointer group transition-all duration-500">
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r={24}
                  fill="none"
                  className="stroke-blue-500/50 dark:stroke-blue-400/50 stroke-[3] animate-pulse"
                />
              )}

              {child.batteryLevel <= 15 && (
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill="none"
                  className="stroke-red-500/40 stroke-2 animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}

              <g className="filter drop-shadow-md">
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  className={`${isSelected ? 'fill-blue-500 dark:fill-blue-600' : 'fill-white dark:fill-slate-800'} transition-colors duration-300`}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  className="fill-slate-100 dark:fill-slate-700"
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="text-base select-none"
                >
                  {child.avatar}
                </text>
              </g>

              {/* Kids Name Tag and Battery Info */}
              <g transform={`translate(${x}, ${y + 28})`}>
                <rect
                  x="-32"
                  y="-10"
                  width="64"
                  height="16"
                  rx="4"
                  className="fill-slate-900/90 dark:fill-slate-950/95 backdrop-blur-sm"
                />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  className="fill-white font-sans text-[9px] font-bold"
                >
                  {child.name} ({child.batteryLevel}%)
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Dynamic Interaction Menu when clicked on Map */}
      {clickPos && (
        <div
          className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-xl flex flex-col gap-1.5 z-20 w-52 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.min(clickPos.x + 10, MAP_WIDTH - 220) / MAP_WIDTH * 100}%`,
            top: `${Math.min(clickPos.y + 10, MAP_HEIGHT - 170) / MAP_HEIGHT * 100}%`
          }}
        >
          <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Lat: {clickPos.lat.toFixed(5)}, Lng: {clickPos.lng.toFixed(5)}
            </span>
            <button
              onClick={() => setClickPos(null)}
              className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-left w-full px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-950/50 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 text-green-500" />
            Criar Cerca Virtual Aqui
          </button>

          {children.map(child => (
            <button
              key={child.id}
              onClick={() => teleportChild(child.id)}
              className="flex items-center gap-2 text-left w-full px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
            >
              <MapPin className="h-4 w-4 text-blue-500" />
              Teleportar {child.name} aqui
            </button>
          ))}
        </div>
      )}

      {/* Create Safe Zone Modal */}
      {showCreateModal && clickPos && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-30">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-green-500" />
                Nova Cerca Virtual
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); setClickPos(null); }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateZoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Nome do Local
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Casa da Vovó, Escola de Futebol"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500/25 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Raio (metros)
                  </label>
                  <select
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none transition-colors"
                  >
                    <option value={50}>50m</option>
                    <option value={100}>100m</option>
                    <option value={150}>150m</option>
                    <option value={200}>200m</option>
                    <option value={300}>300m</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Tipo do Local
                  </label>
                  <select
                    value={newZoneType}
                    onChange={(e) => setNewZoneType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
                  >
                    <option value="custom">Outro ⚙️</option>
                    <option value="home">Casa 🏠</option>
                    <option value="school">Escola 🏫</option>
                    <option value="park">Parque 🌳</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setClickPos(null); }}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-green-500/20"
                >
                  <Check className="h-4 w-4" />
                  Salvar Cerca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
