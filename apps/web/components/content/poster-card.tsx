"use client";

interface PosterCardProps {
  title: string;
  posterUrl: string | null;
  rating?: string | null;
  year?: string | null;
  onClick: () => void;
}

export function PosterCard({ title, posterUrl, rating, year, onClick }: PosterCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-lg overflow-hidden bg-surface-light hover:ring-2 hover:ring-primary/50 transition-all"
    >
      <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Poster</div>
        )}
        {rating && (
          <span className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded">
            {rating}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium truncate group-hover:text-primary-light transition-colors">{title}</p>
        {year && <p className="text-xs text-gray-500">{year}</p>}
      </div>
    </button>
  );
}
