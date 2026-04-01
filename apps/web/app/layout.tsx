import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MiniPlayer } from "@/components/player/mini-player";

export const metadata: Metadata = {
  title: "StreamVault",
  description: "Self-hosted streaming platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-white">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
        <MiniPlayer />
      </body>
    </html>
  );
}
