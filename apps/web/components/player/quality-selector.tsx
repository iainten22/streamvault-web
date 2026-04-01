"use client";
import { useState, useRef, useEffect } from "react";
import type { QualityLevel } from "@/stores/player-store";

interface QualitySelectorProps {
  levels: QualityLevel[];
  active: number;
  onSelect: (index: number) => void;
}

export function QualitySelector({ levels, active, onSelect }: QualitySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (levels.length === 0) return null;

  const activeLabel = active === -1 ? "Auto" : levels.find((l) => l.index === active)?.label ?? "Auto";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition"
      >
        {activeLabel}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-surface-light border border-white/10 rounded shadow-lg min-w-[120px] py-1">
          <button
            className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${active === -1 ? "text-primary-light" : "text-gray-300"}`}
            onClick={() => { onSelect(-1); setOpen(false); }}
          >
            Auto
          </button>
          {levels.map((level) => (
            <button
              key={level.index}
              className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${active === level.index ? "text-primary-light" : "text-gray-300"}`}
              onClick={() => { onSelect(level.index); setOpen(false); }}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
