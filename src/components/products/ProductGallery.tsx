import { useState } from 'react';
import { ProductImage } from '@/types/products';
import { API_BASE_URL } from '@/lib/api';
// import './ProductGallery.css';

interface ProductGalleryProps {
  images: ProductImage[];
}

const ProductGallery = ({ images = [] }: ProductGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="product-gallery">
        <div className="main-image">
          <img 
            src="/placeholder-product.jpg" 
            alt="No image available"
            className="product-image"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="thumbnail-container">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img 
                src={`${API_BASE_URL}/../uploads/products/${image.url}`} 
                alt={image.alt || `Product thumbnail ${index + 1}`}
                className="thumbnail-image"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="main-image">
        <img 
          src={`${API_BASE_URL}/../uploads/products/${images[selectedImageIndex].url}`} 
          alt={images[selectedImageIndex].alt || 'Product main image'}
          className="product-image"
        />
      </div>
    </div>
  );
};

export default ProductGallery;