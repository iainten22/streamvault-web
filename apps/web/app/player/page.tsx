"use client";
import { Suspense, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { VideoPlayer } from "@/components/player/video-player";
import { usePlayerStore } from "@/stores/player-store";
import { usePlayerKeyboard } from "@/hooks/use-player-keyboard";
import { api } from "@/lib/api-client";

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
      <PlayerPageInner />
    </Suspense>
  );
}

function PlayerPageInner() {
  const searchParams = useSearchParams();
  const serverId = searchParams.get("serverId");
  const streamId = searchParams.get("streamId");
  const type = (searchParams.get("type") ?? "live") as "live" | "movie" | "series";
  const title = searchParams.get("title") ?? "Stream";
  const logoUrl = searchParams.get("logo") ?? undefined;
  const directUrl = searchParams.get("directUrl");

  const { setStream, togglePlay, toggleMute, setVolume, volume } = usePlayerStore();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (directUrl) {
      setStream({
        url: directUrl,
        title,
        streamId: 0,
        serverId: 0,
        type,
        logoUrl,
      });
      return;
    }

    if (!serverId || !streamId) return;

    const extension = type === "live" ? "ts" : "mp4";
    api
      .get<{ url: string }>(
        `/api/xtream/${serverId}/stream-url?type=${type}&stream_id=${streamId}&extension=${extension}`,
      )
      .then(({ url }) => {
        setStream({
          url,
          title,
          streamId: parseInt(streamId),
          serverId: parseInt(serverId),
          type,
          logoUrl,
        });
      });
  }, [serverId, streamId, type, title, logoUrl, directUrl, setStream]);

  const seekRelative = useCallback((seconds: number) => {
    const video = document.querySelector("video");
    if (video) video.currentTime += seconds;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoContainerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const togglePip = useCallback(async () => {
    const video = document.querySelector("video");
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {}
  }, []);

  const adjustVolume = useCallback(
    (delta: number) => setVolume(volume + delta),
    [volume, setVolume],
  );

  const keyboardActions = useMemo(
    () => ({
      togglePlay,
      toggleMute,
      toggleFullscreen,
      togglePip,
      seekRelative,
      adjustVolume,
    }),
    [togglePlay, toggleMute, toggleFullscreen, togglePip, seekRelative, adjustVolume],
  );

  usePlayerKeyboard(keyboardActions);

  return (
    <div ref={videoContainerRef} className="fixed inset-0 z-50 bg-black">
      <VideoPlayer />
    </div>
  );
}
