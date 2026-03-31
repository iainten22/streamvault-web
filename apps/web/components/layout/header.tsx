"use client";
import { useAuth } from "@/hooks/use-auth";
import { useServerStore } from "@/stores/server-store";
import { Button } from "@/components/common/button";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();
  const { servers, activeServerId, setActiveServer } = useServerStore();

  return (
    <header className="h-14 bg-surface-light border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        {servers.length > 0 && (
          <select
            value={activeServerId ?? ""}
            onChange={(e) => setActiveServer(Number(e.target.value))}
            className="bg-surface border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-400">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="secondary" size="sm">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
