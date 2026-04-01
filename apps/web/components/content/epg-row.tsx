"use client";
import type { XtreamEpgListingDto } from "@streamvault/shared";

interface EpgRowProps {
  channelName: string;
  channelIcon: string | null;
  listings: XtreamEpgListingDto[];
  startHour: number;
  hoursVisible: number;
  onProgramClick?: (listing: XtreamEpgListingDto) => void;
}

function formatHHMM(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function EpgRow({ channelName, channelIcon, listings, startHour, hoursVisible, onProgramClick }: EpgRowProps) {
  const windowStart = startHour;
  const windowEnd = startHour + hoursVisible * 3600;
  const now = Date.now() / 1000;

  return (
    <div className="flex items-stretch h-16 border-b border-gray-800">
      <div className="w-44 shrink-0 flex items-center gap-2 px-3 bg-surface-light border-r border-gray-800">
        {channelIcon && <img src={channelIcon} alt="" className="w-8 h-8 object-contain rounded" />}
        <span className="text-xs truncate">{channelName}</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {listings.map((listing) => {
          const start = parseInt(listing.start_timestamp);
          const end = parseInt(listing.stop_timestamp);
          if (end <= windowStart || start >= windowEnd) return null;
          const clampedStart = Math.max(start, windowStart);
          const clampedEnd = Math.min(end, windowEnd);
          const leftPct = ((clampedStart - windowStart) / (hoursVisible * 3600)) * 100;
          const widthPct = ((clampedEnd - clampedStart) / (hoursVisible * 3600)) * 100;
          const isCurrent = now >= start && now < end;
          return (
            <button
              key={listing.id}
              onClick={() => onProgramClick?.(listing)}
              className={`absolute top-1 bottom-1 rounded text-xs px-2 flex items-center overflow-hidden transition ${
                isCurrent
                  ? "bg-primary/30 border border-primary/50 text-white"
                  : "bg-surface-light hover:bg-white/10 text-gray-300"
              }`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              title={`${formatHHMM(listing.start)} - ${formatHHMM(listing.end)}\n${listing.title}`}
            >
              <span className="truncate">{listing.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
