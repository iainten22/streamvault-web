"use client";
import { useEffect, useRef } from "react";

interface ZapOverlayProps {
  channelName: string;
  channelNumber: number;
  channelIcon: string | null;
  visible: boolean;
  onConfirm: () => void;
}

export function ZapOverlay({ channelName, channelNumber, channelIcon, visible, onConfirm }: ZapOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onConfirm(), 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, channelNumber, onConfirm]);

  if (!visible) return null;

  return (
    <div className="absolute top-6 right-6 z-50 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4 animate-in fade-in duration-200">
      {channelIcon && <img src={channelIcon} alt="" className="w-12 h-12 rounded object-contain" />}
      <div>
        <p className="text-2xl font-bold tabular-nums">{channelNumber}</p>
        <p className="text-sm text-gray-300 max-w-[200px] truncate">{channelName}</p>
      </div>
    </div>
  );
}
