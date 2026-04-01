"use client";
import { useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { ChannelCard } from "@/components/content/channel-card";
import { Loading } from "@/components/common/loading";
import type { XtreamLiveStreamDto } from "@streamvault/shared";

export default function CatchupPage() {
  const { activeServerId } = useServerStore();

  const streamsPath = activeServerId ? `/api/xtream/${activeServerId}/live/streams` : null;
  const { data: streams, loading } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  const archiveChannels = useMemo(
    () => (streams ?? []).filter((s) => s.tv_archive === 1),
    [streams],
  );

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected. Add one in Settings.</p></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Catch-up / Replay</h1>
      <p className="text-sm text-gray-400 mb-6">Channels with TV archive enabled. Click to view live; catch-up replay available in the EPG guide.</p>

      {loading ? (
        <Loading className="py-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {archiveChannels.map((channel) => (
            <ChannelCard
              key={channel.stream_id}
              channel={channel}
              onClick={() => {
                window.location.href = `/player?serverId=${activeServerId}&streamId=${channel.stream_id}&type=live&title=${encodeURIComponent(channel.name)}&logo=${encodeURIComponent(channel.stream_icon ?? "")}`;
              }}
            />
          ))}
        </div>
      )}
      {archiveChannels.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-8">No channels with catch-up available.</p>
      )}
    </div>
  );
}
