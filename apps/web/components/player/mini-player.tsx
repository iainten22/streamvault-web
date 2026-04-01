"use client";
import { useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, X, Volume2 } from "lucide-react";
import { useMusicStore } from "@/stores/music-store";

export function MiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack, playing, volume, currentTime, duration,
    togglePlay, next, previous, setCurrentTime, setDuration, setVolume, stop, resume, pause,
  } = useMusicStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.streamUrl;
    audio.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.play().catch(() => {}); } else { audio.pause(); }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => next();
    const onPlay = () => resume();
    const onPause = () => pause();
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [setCurrentTime, setDuration, next, resume, pause]);

  if (!currentTrack) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <>
      <audio ref={audioRef} />
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-light border-t border-gray-800 px-4 py-2">
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gray-800 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            if (audioRef.current && duration > 0) { audioRef.current.currentTime = ratio * duration; }
          }}
        >
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 w-60">
            {currentTrack.icon && <img src={currentTrack.icon} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={previous} className="p-1 hover:bg-white/10 rounded transition"><SkipBack size={18} /></button>
            <button onClick={togglePlay} className="p-2 bg-primary rounded-full hover:bg-primary/80 transition">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={next} className="p-1 hover:bg-white/10 rounded transition"><SkipForward size={18} /></button>
          </div>
          <span className="text-xs text-gray-400 tabular-nums w-24 text-center">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-gray-400" />
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 accent-primary h-1" />
          </div>
          <button onClick={stop} className="p-1 hover:bg-white/10 rounded transition text-gray-400"><X size={18} /></button>
        </div>
      </div>
    </>
  );
}
