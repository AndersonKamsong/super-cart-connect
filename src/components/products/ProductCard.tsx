import { API_BASE_URL } from '@/lib/api';
import { Product } from '@/types/products';
import { Link } from 'react-router-dom';
// import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = product.images?.[0]?.url || '/placeholder-product.jpg';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image-container hover:shadow-md transition-shadow">
        <img
          src={
            mainImage.startsWith('blob:')
              ? mainImage
              : `${API_BASE_URL}/../uploads/products/${mainImage}`
          }
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://placehold.co/400x200/e0e0e0/000000?text=${product.name.charAt(0)}`;
          }}
        />
        {product.isFeatured && (
          <span className="featured-badge">Featured</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-price-container">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="original-price">${product.comparePrice?.toFixed(2)}</span>
          )}
        </div>

        <div className="product-meta">
          <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.isBestseller && (
            <span className="bestseller-tag">Bestseller</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;