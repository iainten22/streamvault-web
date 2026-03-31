"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Tv, Film, MonitorPlay, Music, Radio, Trophy,
  History, Heart, CalendarDays, Search, Settings, Puzzle,
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/live", icon: Tv, label: "Live TV" },
  { href: "/vod", icon: Film, label: "Movies" },
  { href: "/series", icon: MonitorPlay, label: "Series" },
  { href: "/stremio", icon: Puzzle, label: "Stremio" },
  { href: "/music", icon: Music, label: "Music" },
  { href: "/radio", icon: Radio, label: "Radio" },
  { href: "/sports", icon: Trophy, label: "Sports" },
  { href: "/catchup", icon: History, label: "Catch-up" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/epg", icon: CalendarDays, label: "EPG" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-surface-light border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary">StreamVault</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                active ? "bg-primary/20 text-primary-light border-r-2 border-primary" : "text-gray-400 hover:text-white hover:bg-surface"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
