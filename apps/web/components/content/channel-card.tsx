import type { XtreamLiveStreamDto } from "@streamvault/shared";

interface ChannelCardProps {
  channel: XtreamLiveStreamDto;
  onClick: () => void;
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-surface-light rounded-lg p-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left w-full"
    >
      {channel.stream_icon ? (
        <img
          src={channel.stream_icon}
          alt=""
          className="w-12 h-12 rounded object-contain bg-surface shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-12 h-12 rounded bg-surface flex items-center justify-center text-gray-600 text-xs shrink-0">
          TV
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium truncate">{channel.name}</p>
        {channel.num > 0 && <p className="text-xs text-gray-500">Ch. {channel.num}</p>}
      </div>
    </button>
  );
}
