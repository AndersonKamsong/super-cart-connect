import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductQueryParams } from '@/types/products';
import { productService } from '@/services/productService';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/products/EmptyState';
import '../../assets/css/ProductListPage.css';
import { Loader2 } from 'lucide-react';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get query params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const inStock = searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined;
  const sort = searchParams.get('sort') || undefined;
  const tags = searchParams.getAll('tags') || undefined;
  const isFeatured = searchParams.get('isFeatured') || false;
  const isBestseller = searchParams.get('isBestseller') || false;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const params: ProductQueryParams = {
          page,
          limit,
          search,
          category,
          minPrice,
          maxPrice,
          inStock,
          sort,
          tags,
          isFeatured,
          isBestseller
        };
        console.log(params)
        const response = await productService.getProducts(params);
        
        // Updated to match controller response structure
        setProducts(response.products || response.data || []);
        setTotalProducts(response.total);
        setCurrentPage(response.page || page);
        setTotalPages(response.totalPages || Math.ceil(response.total / limit));
        
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', query);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilters: Partial<ProductQueryParams>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update or remove filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.delete(key);
        value.forEach(v => newParams.append(key, v));
      } else {
        newParams.set(key, String(value));
      }
    });
    
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Our Products</h1>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={sort || ''}
            onChange={(e) => handleFilterChange({ sort: e.target.value || undefined })}
            className="sort-select"
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="bestselling">Bestselling</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="product-list-content">
        <ProductFilters 
          currentFilters={{
            category,
            minPrice,
            maxPrice,
            inStock,
            tags,
            isFeatured,
            isBestseller
          }}
          onChange={handleFilterChange}
        />

        <div className="product-list-main">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState 
              title="No products found"
              description="Try adjusting your search or filters"
              action={() => {
                setSearchParams(new URLSearchParams());
              }}
              actionText="Clear Filters"
            />
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                  />
                ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalItems={totalProducts}
                itemsPerPage={limit}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;