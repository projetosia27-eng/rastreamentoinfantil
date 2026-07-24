import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Mic, ShieldAlert, Download, Share2, Radio } from 'lucide-react';

interface EmergencyAudioPlayerProps {
  childName?: string;
  timestamp?: string;
}

export default function EmergencyAudioPlayer({ childName = 'Filho', timestamp = 'Agora' }: EmergencyAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const timerRef = useRef<any>(null);
  const soundNodesRef = useRef<{ osc: OscillatorNode; noise: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const stopAudio = () => {
    setIsPlaying(false);
    setProgressSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (soundNodesRef.current) {
      try {
        soundNodesRef.current.osc.stop();
        soundNodesRef.current.noise.stop();
      } catch (e) {
        // ignore
      }
      soundNodesRef.current = null;
    }
    if (audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
    }
  };

  const playAmbientAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);

      // Create white noise buffer to simulate ambient mic sound
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.015; // Low ambient rumble
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Pulse oscillator simulating background alert audio signal
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(audioMuted ? 0 : 0.05, ctx.currentTime);

      whiteNoise.connect(gain);
      osc.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      osc.start();

      soundNodesRef.current = { osc, noise: whiteNoise, gain };
      setIsPlaying(true);
      setProgressSeconds(0);

      let current = 0;
      timerRef.current = setInterval(() => {
        current += 1;
        setProgressSeconds(current);
        if (current >= 10) {
          stopAudio();
        }
      }, 1000);
    } catch (err) {
      console.warn('Web Audio Playback failed:', err);
      // Fallback timer even if audio fails
      setIsPlaying(true);
      let current = 0;
      timerRef.current = setInterval(() => {
        current += 1;
        setProgressSeconds(current);
        if (current >= 10) {
          stopAudio();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-red-500/30 shadow-lg relative overflow-hidden">
      {/* Background Pulse Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
            <Mic className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              Áudio de Emergência (Ambiência SOS)
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              Capturado pelo microfone de {childName} • {timestamp}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
          10 segundos
        </span>
      </div>

      {/* Audio Waveform Bars Simulation */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3 flex items-center justify-center gap-1.5 h-12">
        {[40, 70, 30, 90, 60, 100, 45, 80, 35, 95, 50, 75, 40, 85, 60, 30, 90, 50, 70, 40].map((height, idx) => (
          <div
            key={idx}
            style={{
              height: isPlaying ? `${Math.max(15, (height * (Math.sin(idx + progressSeconds * 2) + 1.2)) / 2)}%` : `${height * 0.3}%`,
            }}
            className={`w-1 rounded-full transition-all duration-150 ${
              isPlaying
                ? idx % 2 === 0
                  ? 'bg-red-500 shadow-sm shadow-red-500/50'
                  : 'bg-amber-400'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Playback Controls & Progress */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={playAmbientAudio}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 active:scale-95'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              <span>Parar Reprodução ({10 - progressSeconds}s)</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>Escutar Áudio do SOS (10s)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setAudioMuted(!audioMuted);
            if (soundNodesRef.current?.gain && audioCtx) {
              soundNodesRef.current.gain.gain.setValueAtTime(audioMuted ? 0.05 : 0, audioCtx.currentTime);
            }
          }}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
          title={audioMuted ? 'Ativar Som' : 'Mutar'}
        >
          {audioMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
        </button>
      </div>

      {/* Transcript Info */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate">🗣️ Ambiência: Ruídos de fundo capturados com sucesso</span>
        <span className="font-bold text-red-400 shrink-0">Status: Salvo na Nuvem</span>
      </div>
    </div>
  );
}
