// src/pages/CategoriesPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '@/types/category';
import { Product } from '@/types/products';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { Loader2 } from 'lucide-react';
import '../../assets/css/CategoriesPage.css';
import { API_BASE_URL } from '@/lib/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all categories
        const categoriesResponse = await categoryService.getCategories();
        if (!categoriesResponse.success) {
          throw new Error(categoriesResponse.message || 'Failed to fetch categories');
        }
        
        const categoriesData = categoriesResponse.data;
        setCategories(categoriesData);
        
        // Fetch products for each category
        const productsByCategory: Record<string, Product[]> = {};
        
        await Promise.all(
          categoriesData.map(async (category) => {
            try {
              const productsResponse = await productService.getProducts({
                category: category._id,
                limit: 4
              });
              
              if (productsResponse.success === false) {
                console.error(`Error fetching products for category ${category._id}:`, productsResponse.message);
                productsByCategory[category._id] = [];
                return;
              }
              
              productsByCategory[category._id] = productsResponse.products || productsResponse.data || [];
            } catch (err) {
              console.error(`Error fetching products for category ${category._id}:`, err);
              productsByCategory[category._id] = [];
            }
          })
        );
        
        setCategoryProducts(productsByCategory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        console.error('Error in CategoriesPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewAll = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-4">
        <div className="text-destructive text-center max-w-md">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Shop by Category</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const products = categoryProducts[category._id] || [];
          
          return (
            <div 
              key={category._id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <button 
                    onClick={() => handleViewAll(category._id)}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id} className="border rounded p-2">
                      <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <img 
                            src={`${API_BASE_URL}/../uploads/products/${product.images[0].url}`} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ${product.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-gray-500">
                    No products available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;