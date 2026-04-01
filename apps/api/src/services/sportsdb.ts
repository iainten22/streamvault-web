const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const TIMEOUT_MS = 10_000;

export interface SportsEvent {
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

async function sportsGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`SportsDB error: ${response.status}`);
  return response.json() as Promise<T>;
}

export const sportsdbService = {
  async getEventsToday(): Promise<SportsEvent[]> {
    const today = new Date().toISOString().split("T")[0];
    const result = await sportsGet<{ events: SportsEvent[] | null }>(`/eventsday.php?d=${today}`);
    return result.events ?? [];
  },
  async getEventsByDate(date: string): Promise<SportsEvent[]> {
    const result = await sportsGet<{ events: SportsEvent[] | null }>(`/eventsday.php?d=${date}`);
    return result.events ?? [];
  },
  async searchEvents(query: string): Promise<SportsEvent[]> {
    const result = await sportsGet<{ event: SportsEvent[] | null }>(`/searchevents.php?e=${encodeURIComponent(query)}`);
    return result.event ?? [];
  },
};
