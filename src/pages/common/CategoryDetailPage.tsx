// src/pages/CategoryDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category } from '@/types/category';
import { Product } from '@/types/products';
// import { categoryService, productService } from '@/services';
import ProductCard from '@/components/products/ProductCard';
import Pagination from '@/components/common/Pagination';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';

const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState({
    category: true,
    products: true
  });
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Fetch category details
        setLoading(prev => ({ ...prev, category: true }));
        const categoryResponse = await categoryService.getCategoryById(id!);
        if (!categoryResponse.success) {
          throw new Error(categoryResponse.message || 'Category not found');
        }
        setCategory(categoryResponse.data);
        
        // Fetch products for this category
        setLoading(prev => ({ ...prev, products: true }));
        const productsResponse = await productService.getProducts({
          category: id,
          page: currentPage,
          limit: productsPerPage,
          isActive: true
        });
        
        if (!productsResponse.success) {
          throw new Error(productsResponse.message || 'Failed to load products');
        }
        
        setProducts(productsResponse.products || productsResponse.data || []);
        setTotalProducts(productsResponse.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
        console.error('Error in CategoryDetailPage:', err);
      } finally {
        setLoading({ category: false, products: false });
      }
    };

    fetchData();
  }, [id, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading.category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading category details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-4">
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

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-muted-foreground">Category not found</p>
        <Button onClick={() => navigate('/categories')}>
          Browse All Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/categories')}
          className="mb-4 pl-0 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> All Categories
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-2 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {totalProducts} {totalProducts === 1 ? 'Item' : 'Items'}
            </Badge>
            {category.isFeatured && (
              <Badge variant="default" className="text-sm">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading.products ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <p className="text-muted-foreground">No products found in this category</p>
          <Button variant="outline" onClick={() => navigate('/categories')}>
            Explore Other Categories
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
              />
            ))}
          </div>

          {/* Pagination */}
          {totalProducts > productsPerPage && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalItems={totalProducts}
                itemsPerPage={productsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryDetailPage;