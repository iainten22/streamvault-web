"use client";
import { useState } from "react";
import { useServerStore } from "@/stores/server-store";
import { useMultiviewStore } from "@/stores/multiview-store";
import { useApiQuery } from "@/hooks/use-api";
import { MultiviewGrid } from "@/components/player/multiview-grid";
import { Loading } from "@/components/common/loading";
import { api } from "@/lib/api-client";
import type { XtreamLiveStreamDto } from "@streamvault/shared";

export default function MultiviewPage() {
  const { activeServerId } = useServerStore();
  const { layout, setLayout, setSlot, slots } = useMultiviewStore();
  const [addingSlot, setAddingSlot] = useState<number | null>(null);

  const streamsPath = activeServerId ? `/api/xtream/${activeServerId}/live/streams` : null;
  const { data: streams, loading } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  const handleAddChannel = async (slotIndex: number, channel: XtreamLiveStreamDto) => {
    if (!activeServerId) return;
    const { url } = await api.get<{ url: string }>(
      `/api/xtream/${activeServerId}/stream-url?type=live&stream_id=${channel.stream_id}&extension=ts`,
    );
    setSlot(slotIndex, url, channel.name, activeServerId, channel.stream_id);
    setAddingSlot(null);
  };

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected.</p></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-3 shrink-0">
        <h1 className="text-xl font-bold">Multiview</h1>
        <div className="flex gap-1">
          <button onClick={() => setLayout(2)} className={`px-3 py-1 text-sm rounded transition ${layout === 2 ? "bg-primary text-white" : "bg-surface-light text-gray-400 hover:text-white"}`}>2-way</button>
          <button onClick={() => setLayout(4)} className={`px-3 py-1 text-sm rounded transition ${layout === 4 ? "bg-primary text-white" : "bg-surface-light text-gray-400 hover:text-white"}`}>4-way</button>
        </div>
        <div className="flex gap-2 ml-4">
          {slots.slice(0, layout).map((slot, i) => (
            <button key={i} onClick={() => setAddingSlot(addingSlot === i ? null : i)}
              className={`px-3 py-1 text-xs rounded transition ${addingSlot === i ? "bg-primary text-white" : "bg-surface-light text-gray-400 hover:text-white"}`}>
              {slot.streamUrl ? slot.title : `+ Slot ${i + 1}`}
            </button>
          ))}
        </div>
      </div>
      {addingSlot !== null && (
        <div className="mb-3 max-h-48 overflow-y-auto bg-surface-light rounded-lg p-2 shrink-0">
          {loading ? <Loading className="py-2" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
              {(streams ?? []).slice(0, 60).map((ch) => (
                <button key={ch.stream_id} onClick={() => handleAddChannel(addingSlot, ch)}
                  className="text-left text-xs px-2 py-1.5 rounded hover:bg-white/10 truncate transition">{ch.name}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-h-0"><MultiviewGrid /></div>
    </div>
  );
}
