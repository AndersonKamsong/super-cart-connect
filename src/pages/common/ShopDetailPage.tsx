import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '@/types/shop';
import { Product } from '@/types/products';
import ProductCard from '@/components/products/ProductCard';
import Pagination from '@/components/common/Pagination';
import { Loader2, ChevronLeft, Star, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductFilters from '@/components/products/ProductFilters';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/api';
import '../../assets/css/ShopDetailPage.css';
import { shopService } from '@/services/shopService';
import { productService } from '@/services/productService';

const ShopDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState({
    shop: true,
    products: true
  });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'newest',
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    inStock: undefined,
    isFeatured: undefined,
    isBestseller: undefined
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setError(null);

        // Fetch shop details
        if (isMounted) setLoading(prev => ({ ...prev, shop: true }));
        const shopResponse = await shopService.getShop(id!);

        if (!isMounted) return;
        if (!shopResponse.success) {
          throw new Error(shopResponse.message || 'Shop not found');
        }
        setShop(shopResponse.data);

        // Fetch products for this shop
        if (isMounted) setLoading(prev => ({ ...prev, products: true }));
        const productsResponse = await productService.getProductByShop(id, {
          ...filters,
          isActive: true
        });

        if (!isMounted) return;
        if (!productsResponse.success) {
          throw new Error(productsResponse.message || 'Failed to load products');
        }

        setProducts(productsResponse.products || productsResponse.data || []);
        setTotalProducts(productsResponse.total || 0);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load shop');
          console.error('Error in ShopDetailPage:', err);
        }
      } finally {
        if (isMounted) setLoading({ shop: false, products: false });
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  if (loading.shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Shop Header Skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-1/4" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-destructive text-center max-w-md">{error}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Shop not found</p>
        <Button onClick={() => navigate('/shops')}>
          Browse All Shops
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/shops')}
          className="mb-4 pl-0 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> All Shops
        </Button>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <img
              src={shop.logo ? `${API_BASE_URL}/../uploads/shops/${shop.logo}` : '/placeholder-shop.jpg'}
              alt={shop.name}
              className="w-24 h-24 rounded-full border object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-shop.jpg';
              }}
            />
            {shop.isVerified && (
              <Verified className="absolute -bottom-2 -right-2 w-5 h-5 text-blue-500 bg-white rounded-full p-0.5" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{shop.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{shop.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-muted-foreground text-sm ml-1">
                  ({shop.reviewCount || 0} reviews)
                </span>
              </div>
              <Badge variant="secondary" className="text-sm">
                {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
              </Badge>
            </div>
            {shop.description && (
              <p className="text-muted-foreground mt-3 max-w-3xl">
                {shop.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Left */}
        <div className="lg:w-1/4">
          <div className="sticky top-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <ProductFilters
                currentFilters={filters}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Products Grid - Right */}
        <div className="lg:w-3/4">
          {loading.products ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-white p-8 rounded-lg border">
              <p className="text-muted-foreground text-center">No products found matching your criteria</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setFilters(prev => ({
                  ...prev,
                  search: '',
                  minPrice: undefined,
                  maxPrice: undefined,
                  inStock: undefined,
                  isFeatured: undefined,
                  isBestseller: undefined,
                  page: 1
                }))}>
                  Clear Filters
                </Button>
                <Button onClick={() => navigate('/shops')}>
                  Browse Other Shops
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>

              {totalProducts > filters.limit && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={filters.page || 1}
                    totalItems={totalProducts}
                    itemsPerPage={filters.limit || 12}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;