import { Product } from '@/types/products';
// import './ProductInfo.css';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="product-info">
      <h1 className="product-title">{product.name}</h1>
      
      <div className="product-meta">
        {product.shop && (
          <span className="product-shop">Sold by: {product.shop.name}</span>
        )}
        {product.category && (
          <span className="product-category">Category: {product.category.name}</span>
        )}
      </div>

      <div className="product-price-container">
        <span className="current-price">${product.price.toFixed(2)}</span>
        {hasDiscount && (
          <span className="original-price">${product.comparePrice?.toFixed(2)}</span>
        )}
      </div>

      {product.isFeatured && (
        <span className="featured-badge">Featured</span>
      )}
      {product.isBestseller && (
        <span className="bestseller-badge">Bestseller</span>
      )}

      <div className="stock-status">
        {product.stock && product.stock > 0 ? (
          <span className="in-stock">{product.stock} available in stock</span>
        ) : (
          <span className="out-of-stock">Out of stock</span>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;