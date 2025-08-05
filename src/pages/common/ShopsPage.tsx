// src/pages/ShopsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop } from '@/types/shop';
import { Product } from '@/types/products';
// import { shopService, productService } from '@/services';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShopFilters from '@/components/shops/ShopFilters';
import { API_BASE_URL } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import '../../assets/css/ShopsPage.css';
import { shopService } from '@/services/shopService';
import { productService } from '@/services/productService';

interface ShopQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minRating?: number;
    sort?: string;
}

const ShopsPage = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [shopProducts, setShopProducts] = useState<Record<string, Product[]>>({});
    const [loading, setLoading] = useState({
        shops: true,
        products: true
    });
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ShopQueryParams>({
        page: 1,
        limit: 12
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShops = async () => {
            try {
                setLoading(prev => ({ ...prev, shops: true }));
                setError(null);

                const response = await shopService.getShops(filters);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch shops');
                }

                setShops(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load shops');
                console.error('Error fetching shops:', err);
            } finally {
                setLoading(prev => ({ ...prev, shops: false }));
            }
        };

        fetchShops();
    }, [filters]);

    useEffect(() => {
        if (shops.length === 0) return;

        const fetchProducts = async () => {
            try {
                setLoading(prev => ({ ...prev, products: true }));

                const productsByShop: Record<string, Product[]> = {};

                await Promise.all(
                    shops.map(async (shop) => {
                        try {
                            const response = await productService.getProductByShop(
                                shop._id,{
                                limit: 2
                            });

                            productsByShop[shop._id] = response.products || response.data || [];
                        } catch (err) {
                            console.error(`Error fetching products for shop ${shop._id}:`, err);
                            productsByShop[shop._id] = [];
                        }
                    })
                );

                setShopProducts(productsByShop);
            } catch (err) {
                console.error('Error fetching shop products:', err);
            } finally {
                setLoading(prev => ({ ...prev, products: false }));
            }
        };

        fetchProducts();
    }, [shops]);

    const handleFilterChange = (newFilters: Partial<ShopQueryParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleViewShop = (shopId: string) => {
        navigate(`/shops/${shopId}`);
    };

    if (loading.shops) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading shops...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
                <div className="text-destructive text-center max-w-md">{error}</div>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (shops.length === 0 && !loading.shops) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-muted-foreground">No shops found matching your criteria</p>
                <Button variant="outline" onClick={() => setFilters({ page: 1, limit: 12 })}>
                    Clear Filters
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Our Shops</h1>
                    <p className="text-muted-foreground mt-2">
                        Browse products from our trusted sellers
                    </p>
                </div>
                <ShopFilters
                    currentFilters={filters}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                    <div
                        key={shop._id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Shop Header */}
                        <div className="relative">
                            <img
                                src={
                                    shop.logo
                                        ? `${API_BASE_URL}/../uploads/shops/${shop.logo}`
                                        : `https://placehold.co/600x200/e0e0e0/000000?text=${shop.name}`
                                }
                                alt={`${shop.name} banner`}
                                className="w-full h-40 object-cover"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `https://placehold.co/600x200/e0e0e0/000000?text=${shop.name}`;
                                }}
                            />
                            <div className="absolute -bottom-6 left-4">
                                <img
                                    src={
                                        shop.logo
                                            ? `${API_BASE_URL}/../uploads/shops/${shop.logo}`
                                            : `https://placehold.co/80x80/e0e0e0/000000?text=${shop.name.charAt(0)}`
                                    }
                                    alt={`${shop.name} logo`}
                                    className="w-12 h-12 rounded-full border-2 border-white bg-white"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = `https://placehold.co/80x80/e0e0e0/000000?text=${shop.name.charAt(0)}`;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Shop Info */}
                        <div className="pt-8 px-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-semibold text-lg">{shop.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <span>{shop.rating?.toFixed(1) || '0.0'}</span>
                                            <span>★</span>
                                        </Badge>
                                        {shop.isVerified && (
                                            <Badge variant="default">Verified</Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewShop(shop._id)}
                                    className="text-primary hover:text-primary"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            {shop.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {shop.description}
                                </p>
                            )}
                        </div>

                        {/* Shop Products */}
                        <div className="px-4 py-4 border-t mt-4">
                            <h3 className="text-sm font-medium mb-3">Featured Products</h3>

                            {loading.products ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            ) : shopProducts[shop._id]?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {shopProducts[shop._id].map((product) => (
                                        <div
                                            key={product._id}
                                            className="border rounded-md p-2 hover:border-primary transition-colors cursor-pointer"
                                            onClick={() => navigate(`/products/${product._id}`)}
                                        >
                                            <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                                                {product.images?.[0]?.url ? (
                                                    <img
                                                        src={`${API_BASE_URL}/../uploads/products/${product.images[0].url}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = 'https://placehold.co/400x400/e0e0e0/000000?text=Product';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                                                {product.comparePrice && product.comparePrice > product.price && (
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        ${product.comparePrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    No products available
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {shops.length > 0 && (
                <div className="flex justify-center mt-8">
                    <Button
                        variant="outline"
                        disabled={filters.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    >
                        Previous
                    </Button>
                    <span className="mx-4 flex items-center">
                        Page {filters.page || 1}
                    </span>
                    <Button
                        variant="outline"
                        disabled={shops.length < (filters.limit || 12)}
                        onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ShopsPage;