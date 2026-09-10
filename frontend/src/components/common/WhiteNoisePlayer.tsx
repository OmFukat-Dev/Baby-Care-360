import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Moon, X, Play, Square, Clock } from 'lucide-react';

export type SoundType = 'rain' | 'ocean' | 'heartbeat' | 'lullaby';

interface WhiteNoisePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhiteNoisePlayer: React.FC<WhiteNoisePlayerProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundType>('rain');
  const [volume, setVolume] = useState<number>(0.6);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lullabyIntervalRef = useRef<any>(null);

  // Initialize Audio Context on demand
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Stop any currently playing audio nodes
  const stopAudio = () => {
    if (noiseSourceRef.current) {
      try {
        (noiseSourceRef.current as any).stop?.();
        noiseSourceRef.current.disconnect();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
      } catch (e) {}
      lfoRef.current = null;
    }
    if (lullabyIntervalRef.current) {
      clearInterval(lullabyIntervalRef.current);
      lullabyIntervalRef.current = null;
    }
  };

  // Play selected sound synthesis
  const playSound = (sound: SoundType) => {
    stopAudio();
    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (sound === 'rain' || sound === 'ocean') {
      // Pink/Brownian noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.07;
        b2 = 0.85 * b2 + white * 0.12;
        output[i] = (b0 + b1 + b2) * 0.35;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for warm rainfall or rolling ocean
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(sound === 'rain' ? 800 : 400, ctx.currentTime);

      if (sound === 'ocean') {
        // Modulate filter for wave swells
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Wave period ~8s
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;
      }

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();
      noiseSourceRef.current = whiteNoise;

    } else if (sound === 'heartbeat') {
      // Heartbeat pulse simulation
      const interval = setInterval(() => {
        if (!audioCtxRef.current || !isPlaying) return;
        const now = ctx.currentTime;
        
        // Lub
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        gain1.gain.setValueAtTime(volume * 0.8, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // Dub (0.24s later)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(55, now + 0.24);
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.36);
        gain2.gain.setValueAtTime(volume * 0.6, now + 0.24);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.24);
        osc2.stop(now + 0.4);

      }, 1000); // 60 bpm resting heart rate
      lullabyIntervalRef.current = interval;

    } else if (sound === 'lullaby') {
      // Gentle music box lullaby arpeggio
      const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]; // C - E - G - C'
      let noteIndex = 0;
      const interval = setInterval(() => {
        if (!audioCtxRef.current) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIndex % notes.length], now);
        noteGain.gain.setValueAtTime(volume * 0.4, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
        noteIndex++;
      }, 700);
      lullabyIntervalRef.current = interval;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      window.dispatchEvent(new CustomEvent('whitenoise-status', { detail: { isPlaying: false } }));
    } else {
      playSound(activeSound);
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('whitenoise-status', { detail: { isPlaying: true, sound: activeSound } }));
    }
  };

  const selectTrack = (track: SoundType) => {
    setActiveSound(track);
    if (isPlaying) {
      playSound(track);
      window.dispatchEvent(new CustomEvent('whitenoise-status', { detail: { isPlaying: true, sound: track } }));
    }
  };

  // Handle timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            togglePlayback();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, remainingSeconds]);

  const setTimer = (mins: number) => {
    setTimerMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  // Update master gain when volume changes
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="whitenoise-modal">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Moon size={18} className="text-sky-500" />
          <h4 className="font-bold text-sm text-slate-800 m-0">Soothing White Noise</h4>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Sound Track Selector */}
      <div className="sound-track-grid">
        {[
          { key: 'rain', label: 'Gentle Rain', icon: '🌧️' },
          { key: 'ocean', label: 'Ocean Waves', icon: '🌊' },
          { key: 'heartbeat', label: 'Womb Pulse', icon: '💓' },
          { key: 'lullaby', label: 'Lullaby Box', icon: '🎵' },
        ].map(track => (
          <button
            key={track.key}
            onClick={() => selectTrack(track.key as SoundType)}
            className={`sound-track-btn ${activeSound === track.key ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.4rem' }}>{track.icon}</span>
            <span>{track.label}</span>
          </button>
        ))}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-3 my-3 px-1">
        {volume === 0 ? <VolumeX size={16} className="text-slate-400" /> : <Volume2 size={16} className="text-sky-500" />}
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-sky-500"
          style={{ margin: 0 }}
        />
      </div>

      {/* Sleep Timer Bar */}
      <div className="flex items-center justify-between gap-1 mb-4 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-1">
          <Clock size={13} />
          <span>Timer:</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 15, 30, 60].map(mins => (
            <button
              key={mins}
              onClick={() => setTimer(mins)}
              className={`px-2 py-0.5 rounded-md border-none cursor-pointer text-xs font-bold ${timerMinutes === mins ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              style={{ boxShadow: 'none' }}
            >
              {mins === 0 ? 'Off' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Play / Stop Button */}
      <button
        onClick={togglePlayback}
        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${isPlaying ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
      >
        {isPlaying ? (
          <>
            <Square size={16} />
            <span>Stop Audio {remainingSeconds > 0 && `(${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')})`}</span>
          </>
        ) : (
          <>
            <Play size={16} fill="white" />
            <span>Start Soothing Audio</span>
          </>
        )}
      </button>
    </div>
  );
};

export default WhiteNoisePlayer;
