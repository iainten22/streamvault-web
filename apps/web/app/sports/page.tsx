"use client";
import { useState, useMemo } from "react";
import { useServerStore } from "@/stores/server-store";
import { useApiQuery } from "@/hooks/use-api";
import { ChannelCard } from "@/components/content/channel-card";
import { Loading } from "@/components/common/loading";
import { Trophy, Calendar } from "lucide-react";
import type { XtreamCategoryDto, XtreamLiveStreamDto } from "@streamvault/shared";

interface SportsEvent {
  idEvent: string;
  strEvent: string;
  strSport: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
  strTime: string;
  strThumb: string | null;
  strStatus: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

export default function SportsPage() {
  const { activeServerId } = useServerStore();
  const [dateOffset, setDateOffset] = useState(0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d.toISOString().split("T")[0];
  }, [dateOffset]);

  const eventsPath = `/api/sports/events?date=${targetDate}`;
  const { data: eventsData, loading: loadingEvents } = useApiQuery<{ events: SportsEvent[]; date: string }>(eventsPath);

  const categoriesPath = activeServerId ? `/api/xtream/${activeServerId}/live/categories` : null;
  const { data: categories } = useApiQuery<XtreamCategoryDto[]>(categoriesPath);

  const sportsCategoryIds = useMemo(
    () => (categories ?? []).filter((c) => /sport|football|soccer|basketball|tennis|boxing|ufc|nfl|nba|mlb/i.test(c.category_name)).map((c) => c.category_id),
    [categories],
  );

  const firstSportsCat = sportsCategoryIds[0] ?? null;
  const streamsPath = activeServerId && firstSportsCat
    ? `/api/xtream/${activeServerId}/live/streams?category_id=${firstSportsCat}`
    : null;
  const { data: sportsStreams, loading: loadingStreams } = useApiQuery<XtreamLiveStreamDto[]>(streamsPath);

  if (!activeServerId) {
    return <div className="text-center text-gray-400 mt-20"><p>No server selected. Add one in Settings.</p></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy size={24} /> Sports</h1>

      <div className="flex items-center gap-3 mb-6">
        <Calendar size={18} className="text-gray-400" />
        <button onClick={() => setDateOffset(dateOffset - 1)} className="px-3 py-1 text-sm bg-surface-light rounded hover:bg-white/10 transition">← Prev</button>
        <span className="text-sm font-medium">{targetDate}</span>
        <button onClick={() => setDateOffset(dateOffset + 1)} className="px-3 py-1 text-sm bg-surface-light rounded hover:bg-white/10 transition">Next →</button>
        {dateOffset !== 0 && (
          <button onClick={() => setDateOffset(0)} className="px-3 py-1 text-sm bg-primary/20 text-primary-light rounded hover:bg-primary/30 transition">Today</button>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Schedule</h2>
        {loadingEvents ? (
          <Loading className="py-4" />
        ) : (
          <div className="space-y-2 max-w-3xl">
            {(eventsData?.events ?? []).map((event) => (
              <div key={event.idEvent} className="flex items-center gap-4 p-3 bg-surface-light rounded-lg">
                {event.strThumb && <img src={event.strThumb} alt="" className="w-16 h-10 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.strEvent}</p>
                  <p className="text-xs text-gray-400">{event.strLeague} • {event.strSport}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono">{event.strTime?.substring(0, 5) ?? ""}</p>
                  {event.strStatus && (
                    <p className={`text-xs ${event.strStatus === "Match Finished" ? "text-gray-500" : "text-green-400"}`}>{event.strStatus}</p>
                  )}
                  {event.intHomeScore != null && event.intAwayScore != null && (
                    <p className="text-xs text-yellow-400">{event.intHomeScore} - {event.intAwayScore}</p>
                  )}
                </div>
              </div>
            ))}
            {(eventsData?.events ?? []).length === 0 && (
              <p className="text-gray-500 text-sm">No events scheduled for {targetDate}.</p>
            )}
          </div>
        )}
      </section>

      {sportsStreams && sportsStreams.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Sports Channels</h2>
          {loadingStreams ? (
            <Loading className="py-4" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sportsStreams.map((channel) => (
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
        </section>
      )}
    </div>
  );
}
