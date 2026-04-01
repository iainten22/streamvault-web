"use client";
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { useMultiviewStore, type MultiviewSlot } from "@/stores/multiview-store";
import { Volume2, VolumeX, Maximize2, X } from "lucide-react";

function SlotPlayer({ slot, isAudioActive, onActivateAudio, onSwapFull, onClear }: {
  slot: MultiviewSlot; isAudioActive: boolean;
  onActivateAudio: () => void; onSwapFull: () => void; onClear: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (!slot.streamUrl) { video.src = ""; return; }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, startLevel: -1 });
      hlsRef.current = hls;
      hls.loadSource(slot.streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      });
    } else { video.src = slot.streamUrl; video.play().catch(() => {}); }
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [slot.streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !isAudioActive;
  }, [isAudioActive]);

  if (!slot.streamUrl) {
    return <div className="bg-gray-900 flex items-center justify-center text-gray-600 text-sm rounded-lg">{slot.title} — Empty</div>;
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      <video ref={videoRef} className="w-full h-full object-contain" playsInline muted={!isAudioActive} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
        <span className="text-xs truncate bg-black/60 px-2 py-1 rounded">{slot.title}</span>
        <div className="flex gap-1">
          <button onClick={onActivateAudio} className="p-1 bg-black/60 rounded hover:bg-black/80 transition" title="Set audio source">
            {isAudioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button onClick={onSwapFull} className="p-1 bg-black/60 rounded hover:bg-black/80 transition" title="Swap to primary">
            <Maximize2 size={14} />
          </button>
          <button onClick={onClear} className="p-1 bg-black/60 rounded hover:bg-black/80 transition text-red-400" title="Remove">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MultiviewGrid() {
  const { slots, layout, activeAudioSlot, setActiveAudio, swapToFull, clearSlot } = useMultiviewStore();
  const visibleSlots = slots.slice(0, layout);
  const gridClass = layout === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2";
  return (
    <div className={`grid ${gridClass} gap-1 w-full h-full`}>
      {visibleSlots.map((slot) => (
        <SlotPlayer key={slot.id} slot={slot} isAudioActive={slot.id === activeAudioSlot}
          onActivateAudio={() => setActiveAudio(slot.id)} onSwapFull={() => swapToFull(slot.id)} onClear={() => clearSlot(slot.id)} />
      ))}
    </div>
  );
}
