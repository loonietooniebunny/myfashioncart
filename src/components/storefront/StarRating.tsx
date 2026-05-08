import { Star } from "lucide-react";

export const StarRating = ({
  value, size = 14, onChange, count,
}: { value: number; size?: number; onChange?: (v: number) => void; count?: number }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex">
        {stars.map(s => {
          const filled = value >= s - 0.25;
          const half = !filled && value >= s - 0.75;
          return (
            <button
              key={s} type="button" disabled={!onChange}
              onClick={() => onChange?.(s)}
              className={`${onChange ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
              aria-label={`${s} star${s > 1 ? "s" : ""}`}
            >
              <Star
                style={{ width: size, height: size }}
                className={filled || half ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}
              />
            </button>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
};
