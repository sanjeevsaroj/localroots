import * as Icons from "lucide-react";
import { Link } from "react-router-dom";

export default function CategoryCard({ category, selected = false }) {
  const Icon = Icons[category.icon] || Icons.Tag;
  return (
    <Link
      to={`/products?category=${category.id}`}
      className={`category-card${selected ? " selected" : ""}`}
    >
      <span className="cat-icon">
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <span className="cat-name">{category.name}</span>
    </Link>
  );
}
