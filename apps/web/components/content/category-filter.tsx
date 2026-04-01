import type { XtreamCategoryDto } from "@streamvault/shared";

interface CategoryFilterProps {
  categories: XtreamCategoryDto[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="w-52 shrink-0 overflow-y-auto border-r border-gray-800 pr-3 space-y-0.5">
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
          selected === null ? "bg-primary/20 text-primary-light" : "text-gray-400 hover:text-white hover:bg-surface-light"
        }`}
      >
        All Channels
      </button>
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          onClick={() => onSelect(cat.category_id)}
          className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors ${
            selected === cat.category_id ? "bg-primary/20 text-primary-light" : "text-gray-400 hover:text-white hover:bg-surface-light"
          }`}
        >
          {cat.category_name}
        </button>
      ))}
    </div>
  );
}
