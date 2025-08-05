import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/types/products';
import { productService } from '@/services/productService';
import { Loader2, Box } from 'lucide-react'; // Added Box icon for 3D view
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductVariants from '@/components/products/ProductVariants';
import RelatedProducts from '@/components/products/RelatedProducts';
import AddToCartButton from '@/components/products/AddToCartButton';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import '../../assets/css/ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const productData = await productService.getProductById(id!);
                setProduct(productData.data);

                const related = await productService.getRelatedProducts(productData?.data?.category?.id || ''!);
                setRelatedProducts(related.data);
                setError(null);
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            productId: product._id || product.id,
            shopId: product.shop,
            variantId: selectedVariant,
            quantity: quantity,
            price: product.price,
            name: product.name,
            image: product.images?.[0]?.url || ''
        });
        navigate('/cart');
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 1) return;
        if (product?.stock && newQuantity > product.stock) return;
        setQuantity(newQuantity);
    };

    const navigateTo3DView = () => {
        navigate(`/products/${id}/3d`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <Button onClick={() => navigate('/products')}>Back to Products</Button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <div className="error-message">Product not found</div>
                <Button onClick={() => navigate('/products')}>Back to Products</Button>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-main">
                {/* Product Gallery */}
                <div className="product-gallery-section">
                    <ProductGallery images={product.images} />
                </div>

                {/* Product Info */}
                <div className="product-info-section">
                    <ProductInfo product={product} />

                    {/* Variant Selection */}
                    {product.variants && product.variants.length > 0 && (
                        <ProductVariants
                            variants={product.variants}
                            options={product.options}
                            onSelectVariant={setSelectedVariant}
                        />
                    )}

                    {/* Quantity Selector */}
                    <div className="quantity-selector">
                        <Button
                            variant="outline"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                        >
                            -
                        </Button>
                        <span>{quantity}</span>
                        <Button
                            variant="outline"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={product.stock !== undefined && quantity >= product.stock}
                        >
                            +
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <AddToCartButton
                            stock={product.stock}
                            onAddToCart={handleAddToCart}
                        />
                        
                        {/* 3D View Button - Only show if product has 3D model */}
                        {product.has3DModel && (
                            <Button 
                                variant="outline"
                                onClick={navigateTo3DView}
                                className="view-3d-button"
                            >
                                <Box className="mr-2 h-4 w-4" />
                                View in 3D
                            </Button>
                        )}
                    </div>

                    {/* Product Description */}
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description || 'No description available.'}</p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h2>You May Also Like</h2>
                    <RelatedProducts products={relatedProducts} />
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;