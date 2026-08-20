import { Star } from "lucide-react";

export default function Rating({ value, count, size = 14 }) {
  return (
    <span className="rating">
      <Star size={size} strokeWidth={0} />
      {value?.toFixed ? value.toFixed(1) : value}
      {count !== undefined && <span className="rating-count">({count})</span>}
    </span>
  );
}
