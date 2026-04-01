"use client";
import { useState, useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { EpgRow } from "@/components/content/epg-row";
import { Loading } from "@/components/common/loading";
import type { XtreamLiveStreamDto, XtreamShortEpgResponse } from "@streamvault/shared";

export default function EpgPage() {
  const { activeServerId } = useServerStore();
  const [offsetHours, setOffsetHours] = useState(0);

  const streamsPath = activeServerId ? `/api/xtream/${activeServerId}/live/streams` : null;
  const { data: streams, loading } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  const visibleChannels = useMemo(() => (streams ?? []).slice(0, 30), [streams]);

  const now = Math.floor(Date.now() / 1000);
  const startHour = now - (now % 3600) + offsetHours * 3600;
  const hoursVisible = 4;

  const timeLabels = Array.from({ length: hoursVisible + 1 }, (_, i) => {
    const t = new Date((startHour + i * 3600) * 1000);
    return `${String(t.getHours()).padStart(2, "0")}:00`;
  });

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected. Add one in Settings.</p></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">EPG Guide</h1>
        <div className="flex gap-2">
          <button onClick={() => setOffsetHours(offsetHours - 4)} className="px-3 py-1 text-sm bg-surface-light rounded hover:bg-white/10 transition">← Earlier</button>
          <button onClick={() => setOffsetHours(0)} className="px-3 py-1 text-sm bg-primary/20 text-primary-light rounded hover:bg-primary/30 transition">Now</button>
          <button onClick={() => setOffsetHours(offsetHours + 4)} className="px-3 py-1 text-sm bg-surface-light rounded hover:bg-white/10 transition">Later →</button>
        </div>
      </div>

      {loading ? (
        <Loading className="py-8" />
      ) : (
        <div className="flex-1 overflow-y-auto border border-gray-800 rounded-lg">
          <div className="flex sticky top-0 z-10 bg-surface border-b border-gray-800">
            <div className="w-44 shrink-0 px-3 py-2 text-xs text-gray-500 border-r border-gray-800">Channel</div>
            <div className="flex-1 flex">
              {timeLabels.map((label, i) => (
                <div key={i} className="flex-1 px-2 py-2 text-xs text-gray-500 border-r border-gray-800 last:border-r-0">
                  {label}
                </div>
              ))}
            </div>
          </div>

          {visibleChannels.map((channel) => (
            <EpgChannelRow
              key={channel.stream_id}
              channel={channel}
              serverId={activeServerId}
              startHour={startHour}
              hoursVisible={hoursVisible}
            />
          ))}
          {visibleChannels.length === 0 && (
            <p className="text-gray-500 text-center py-8">No channels found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function EpgChannelRow({
  channel,
  serverId,
  startHour,
  hoursVisible,
}: {
  channel: XtreamLiveStreamDto;
  serverId: number;
  startHour: number;
  hoursVisible: number;
}) {
  const epgPath = `/api/xtream/${serverId}/epg/${channel.stream_id}`;
  const { data } = useApiQuery<XtreamShortEpgResponse>(epgPath);

  return (
    <EpgRow
      channelName={channel.name}
      channelIcon={channel.stream_icon}
      listings={data?.epg_listings ?? []}
      startHour={startHour}
      hoursVisible={hoursVisible}
      onProgramClick={() => {
        window.location.href = `/player?serverId=${serverId}&streamId=${channel.stream_id}&type=live&title=${encodeURIComponent(channel.name)}&logo=${encodeURIComponent(channel.stream_icon ?? "")}`;
      }}
    />
  );
}
