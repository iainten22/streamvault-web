"use client";
import { useState, useRef } from "react";
import { FileVideo, FileAudio, Upload } from "lucide-react";

interface LocalFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

export default function LocalMediaPage() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: LocalFile[] = Array.from(fileList).map((f) => ({
      name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const isVideo = (type: string) => type.startsWith("video/");

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Local Media</h1>
      <div
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={32} className="mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400 mb-1">Drop files here or click to browse</p>
        <p className="text-xs text-gray-600">Supports MP4, MKV, AVI, MP3, FLAC, and more</p>
        <input ref={inputRef} type="file" multiple accept="video/*,audio/*" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <button key={i}
              onClick={() => { window.location.href = `/player?serverId=0&streamId=0&type=movie&title=${encodeURIComponent(file.name)}&directUrl=${encodeURIComponent(file.url)}`; }}
              className="w-full flex items-center gap-4 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition text-left">
              {isVideo(file.type) ? <FileVideo size={24} className="text-blue-400 shrink-0" /> : <FileAudio size={24} className="text-pink-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)} • {file.type || "unknown"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {files.length === 0 && <p className="text-gray-500 text-center py-4">No files loaded. Add some above to play.</p>}
    </div>
  );
}
