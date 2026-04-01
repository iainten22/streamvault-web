"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import Hls from "hls.js";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  const {
    stream,
    playing,
    muted,
    volume,
    currentTime,
    duration,
    buffered,
    qualityLevels,
    activeQuality,
    subtitleTracks,
    activeSubtitle,
    isFullscreen,
    isPip,
    setPlaying,
    togglePlay,
    toggleMute,
    setVolume,
    setCurrentTime,
    setDuration,
    setBuffered,
    setQualityLevels,
    setActiveQuality,
    setSubtitleTracks,
    setActiveSubtitle,
    setIsFullscreen,
    setIsPip,
  } = usePlayerStore();

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = stream.url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        startLevel: -1,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((level, i) => ({
          index: i,
          height: level.height,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
        }));
        setQualityLevels(levels);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_event, data) => {
        const tracks = data.subtitleTracks.map((t, i) => ({
          index: i,
          label: t.name || t.lang || `Track ${i + 1}`,
          language: t.lang ?? "",
        }));
        setSubtitleTracks(tracks);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [stream, setQualityLevels, setSubtitleTracks]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = activeQuality;
  }, [activeQuality]);

  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.subtitleTrack = activeSubtitle;
  }, [activeSubtitle]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onPipEnter = () => setIsPip(true);
    const onPipLeave = () => setIsPip(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("progress", onProgress);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("enterpictureinpicture", onPipEnter);
    video.addEventListener("leavepictureinpicture", onPipLeave);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("enterpictureinpicture", onPipEnter);
      video.removeEventListener("leavepictureinpicture", onPipLeave);
    };
  }, [setCurrentTime, setDuration, setBuffered, setPlaying, setIsPip]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [setIsFullscreen]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = time;
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const handleTogglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {}
  }, []);

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No stream selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none"
      onMouseMove={resetHideTimer}
      onClick={(e) => {
        if (e.target === videoRef.current) togglePlay();
      }}
      onDoubleClick={(e) => {
        if (e.target === videoRef.current) handleToggleFullscreen();
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />
      <PlayerControls
        title={stream.title}
        playing={playing}
        muted={muted}
        volume={volume}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        isFullscreen={isFullscreen}
        isPip={isPip}
        qualityLevels={qualityLevels}
        activeQuality={activeQuality}
        subtitleTracks={subtitleTracks}
        activeSubtitle={activeSubtitle}
        visible={controlsVisible}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onVolumeChange={setVolume}
        onSeek={handleSeek}
        onToggleFullscreen={handleToggleFullscreen}
        onTogglePip={handleTogglePip}
        onQualityChange={setActiveQuality}
        onSubtitleChange={setActiveSubtitle}
      />
    </div>
  );
}
