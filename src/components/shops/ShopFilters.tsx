// src/components/shops/ShopFilters.tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import './ShopFilters.css';

interface ShopFiltersProps {
  currentFilters: {
    search?: string;
    category?: string;
    minRating?: number;
    sort?: string;
  };
  onChange: (filters: any) => void;
}

const ShopFilters = ({ currentFilters, onChange }: ShopFiltersProps) => {
  return (
    <div className="shop-filters">
      <Input
        placeholder="Search shops..."
        value={currentFilters.search || ''}
        onChange={(e) => onChange({ search: e.target.value })}
        className="search-input"
      />
      
      <Select
        value={currentFilters.sort || ''}
        onValueChange={(value) => onChange({ sort: value })}
      >
        <SelectTrigger className="sort-select">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="productCount">Most Products</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={currentFilters.minRating ? String(currentFilters.minRating) : ''}
        onValueChange={(value) => onChange({ minRating: value ? Number(value) : undefined })}
      >
        <SelectTrigger className="rating-select">
          <SelectValue placeholder="Minimum Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="3">3+ Stars</SelectItem>
          <SelectItem value="2">2+ Stars</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShopFilters;