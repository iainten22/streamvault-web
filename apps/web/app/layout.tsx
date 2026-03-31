import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamVault",
  description: "Self-hosted streaming platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-white">
        <div className="flex h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
