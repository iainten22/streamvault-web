"use client";
import { useEffect } from "react";

interface KeyboardActions {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  togglePip: () => void;
  seekRelative: (seconds: number) => void;
  adjustVolume: (delta: number) => void;
}

export function usePlayerKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          actions.togglePlay();
          break;
        case "m":
          actions.toggleMute();
          break;
        case "f":
          actions.toggleFullscreen();
          break;
        case "p":
          actions.togglePip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          actions.seekRelative(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          actions.seekRelative(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          actions.adjustVolume(0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          actions.adjustVolume(-0.05);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
