import { useRef, useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const MOOD_BEATS = {
  Happy: { freq: 10, desc: 'Alpha (8–12 Hz): Promotes happiness, creativity, and relaxation.' },
  Calm: { freq: 6, desc: 'Theta (4–8 Hz): Deep relaxation, meditation, and calmness.' },
  Anxious: { freq: 3, desc: 'Delta (1–4 Hz): Deep sleep, anxiety relief, and stress reduction.' },
  Sad: { freq: 14, desc: 'Beta (12–30 Hz): Alertness, focus, and mood elevation.' },
  Neutral: { freq: 8, desc: 'Alpha/Theta: Balanced, relaxed, and clear-minded.' },
};

const MOOD_PRESETS = Object.keys(MOOD_BEATS);

interface NeuralBeatsProps {
  mood?: string;
  musicUrl?: string;
}

export function NeuralBeats({ mood = 'Neutral', musicUrl }: NeuralBeatsProps) {
  const [playing, setPlaying] = useState(false);
  const [selectedMood, setSelectedMood] = useState(mood);
  const [customFreq, setCustomFreq] = useState(MOOD_BEATS[mood as keyof typeof MOOD_BEATS].freq);
  const [beatVolume, setBeatVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const beatGainRef = useRef<GainNode | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  const freq = customFreq;
  const desc = MOOD_BEATS[selectedMood as keyof typeof MOOD_BEATS].desc;

  useEffect(() => {
    // Stop everything on unmount
    return () => {
      stop();
    };
    // eslint-disable-next-line
  }, []);

  const start = () => {
    if (playing) return;
    const ctx = new window.AudioContext();
    const base = 440;

    // Neural beats
    const leftOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.value = base;
    const rightOsc = ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.value = base + freq;
    const leftPan = ctx.createStereoPanner();
    leftPan.pan.value = -1;
    const rightPan = ctx.createStereoPanner();
    rightPan.pan.value = 1;
    const beatGain = ctx.createGain();
    beatGain.gain.value = beatVolume;
    leftOsc.connect(leftPan).connect(beatGain).connect(ctx.destination);
    rightOsc.connect(rightPan).connect(beatGain).connect(ctx.destination);
    leftOsc.start();
    rightOsc.start();

    // Music
    let musicAudio: HTMLAudioElement | null = null;
    let musicSource: MediaElementAudioSourceNode | null = null;
    let musicGain: GainNode | null = null;
    if (musicUrl) {
      musicAudio = new window.Audio(musicUrl);
      musicAudio.loop = true;
      musicAudio.crossOrigin = 'anonymous';
      musicSource = ctx.createMediaElementSource(musicAudio);
      musicGain = ctx.createGain();
      musicGain.gain.value = musicVolume;
      musicSource.connect(musicGain).connect(ctx.destination);
      musicAudio.play();
    }

    audioCtxRef.current = ctx;
    leftOscRef.current = leftOsc;
    rightOscRef.current = rightOsc;
    beatGainRef.current = beatGain;
    musicAudioRef.current = musicAudio;
    musicSourceRef.current = musicSource;
    musicGainRef.current = musicGain;
    setPlaying(true);
  };

  const stop = () => {
    leftOscRef.current?.stop();
    rightOscRef.current?.stop();
    audioCtxRef.current?.close();
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  const handleSlider = (value: number[]) => {
    setCustomFreq(value[0]);
    if (playing && rightOscRef.current && audioCtxRef.current) {
      rightOscRef.current.frequency.setValueAtTime(440 + value[0], audioCtxRef.current.currentTime);
    }
  };

  const handlePreset = (preset: string) => {
    setSelectedMood(preset);
    setCustomFreq(MOOD_BEATS[preset as keyof typeof MOOD_BEATS].freq);
    if (playing && rightOscRef.current && audioCtxRef.current) {
      rightOscRef.current.frequency.setValueAtTime(440 + MOOD_BEATS[preset as keyof typeof MOOD_BEATS].freq, audioCtxRef.current.currentTime);
    }
  };

  const handleBeatVolume = (value: number[]) => {
    setBeatVolume(value[0]);
    if (beatGainRef.current) {
      beatGainRef.current.gain.value = value[0];
    }
  };

  const handleMusicVolume = (value: number[]) => {
    setMusicVolume(value[0]);
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = value[0];
    }
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = value[0];
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-2">Neural Beats</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {MOOD_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePreset(preset)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${selectedMood === preset ? 'bg-[#6A9FB5] text-white border-[#6A9FB5]' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-[#6A9FB5] dark:text-[#6A9FB5]'}`}
          >
            {preset}
          </button>
        ))}
      </div>
      <p className="mb-2 text-gray-600 dark:text-gray-300 text-sm text-center min-h-[40px]">{desc}</p>
      <div className="w-full max-w-xs flex flex-col items-center mb-4">
        <label className="text-xs text-gray-500 mb-1">Beat Frequency: <span className="font-mono text-base text-[#6A9FB5]">{customFreq} Hz</span></label>
        <Slider
          value={[customFreq]}
          min={1}
          max={20}
          step={0.1}
          onValueChange={handleSlider}
        />
      </div>
      {musicUrl && (
        <div className="w-full max-w-xs flex flex-col items-center mb-4">
          <label className="text-xs text-gray-500 mb-1">Music Volume</label>
          <Slider
            value={[musicVolume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleMusicVolume}
          />
        </div>
      )}
      <div className="w-full max-w-xs flex flex-col items-center mb-4">
        <label className="text-xs text-gray-500 mb-1">Neural Beat Volume</label>
        <Slider
          value={[beatVolume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleBeatVolume}
        />
      </div>
      <button
        onClick={playing ? stop : start}
        className={`px-6 py-2 rounded-full text-white font-bold transition-colors ${playing ? 'bg-red-500 hover:bg-red-600' : 'bg-[#6A9FB5] hover:bg-[#A3D9A5]'}`}
      >
        {playing ? 'Stop' : 'Play'}
      </button>
      <p className="mt-3 text-xs text-gray-400">(Use headphones for best effect)</p>
    </div>
  );
} 