import { Product } from '@/types/products';
import ProductCard from '@/components/products/ProductCard';
// import './RelatedProducts.css';

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="related-products">
      <div className="related-products-grid">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;