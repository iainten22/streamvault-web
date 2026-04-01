"use client";
import { useState, useEffect, useCallback } from "react";

interface UseZappingOptions {
  channels: { stream_id: number; name: string; stream_icon: string | null; num: number }[];
  currentStreamId: number | null;
  onZapConfirm: (channel: { stream_id: number; name: string; stream_icon: string | null; num: number }) => void;
}

export function useZapping({ channels, currentStreamId, onZapConfirm }: UseZappingOptions) {
  const [zapState, setZapState] = useState<{ zapIndex: number; zapVisible: boolean }>({ zapIndex: -1, zapVisible: false });

  const currentIndex = channels.findIndex((c) => c.stream_id === currentStreamId);

  const zap = useCallback((direction: 1 | -1) => {
    if (channels.length === 0) return;
    setZapState((prev) => {
      const base = prev.zapVisible ? prev.zapIndex : currentIndex;
      let next = base + direction;
      if (next < 0) next = channels.length - 1;
      if (next >= channels.length) next = 0;
      return { zapIndex: next, zapVisible: true };
    });
  }, [channels, currentIndex]);

  const confirmZap = useCallback(() => {
    const channel = channels[zapState.zapIndex];
    if (channel) onZapConfirm(channel);
    setZapState({ zapIndex: -1, zapVisible: false });
  }, [channels, zapState.zapIndex, onZapConfirm]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "PageUp" || e.key === "+" || e.key === "=") { e.preventDefault(); zap(1); }
      else if (e.key === "PageDown" || e.key === "-") { e.preventDefault(); zap(-1); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zap]);

  const zapChannel = zapState.zapVisible ? channels[zapState.zapIndex] ?? null : null;
  return { zapVisible: zapState.zapVisible, zapChannel, zapNumber: zapState.zapIndex + 1, confirmZap };
}
