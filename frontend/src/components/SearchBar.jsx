import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search for pickles, cakes, candles...", className = "" }) {
  return (
    <div className={`search-bar ${className}`}>
      <Search size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />
    </div>
  );
}
