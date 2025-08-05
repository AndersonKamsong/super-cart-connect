import { useState, useEffect } from 'react';
import { ProductQueryParams } from '@/types/products';
import { Category } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';
// import './ProductFilters.css';

interface ProductFiltersProps {
  currentFilters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    tags?: string[];
  };
  onChange: (filters: Partial<ProductQueryParams>) => void;
}

const ProductFilters = ({ currentFilters, onChange }: ProductFiltersProps) => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice?.toString() || '',
    max: currentFilters.maxPrice?.toString() || ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const categoryList = await categoryService.getCategories();
      setCategories(categoryList.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Sync local state with props
  useEffect(() => {
    setPriceRange({
      min: currentFilters.minPrice?.toString() || '',
      max: currentFilters.maxPrice?.toString() || ''
    });
  }, [currentFilters.minPrice, currentFilters.maxPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  const applyPriceFilter = () => {
    onChange({
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyPriceFilter();
    }
  };

  return (
    <div className="product-filters">
      <h3>Filters</h3>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            name="min"
            placeholder="Min"
            value={priceRange.min}
            onChange={handlePriceChange}
            onKeyDown={handleKeyPress}
            min="0"
          />
          <span>to</span>
          <input
            type="number"
            name="max"
            placeholder="Max"
            value={priceRange.max}
            onChange={handlePriceChange}
            onKeyDown={handleKeyPress}
            min="0"
          />
          <button onClick={applyPriceFilter}>Apply</button>
        </div>
      </div>

      <div className="filter-section">
        <h4>Availability</h4>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={currentFilters.inStock || false}
            onChange={(e) => onChange({ inStock: e.target.checked })}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Example category filter - would be populated from API in real app */}
      <div className="filter-section">
        <h4>Categories</h4>
        <select
          value={currentFilters.category || ''}
          onChange={(e) => onChange({ category: e.target.value || undefined })}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(item => (
            <option value={item._id}>{item.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;