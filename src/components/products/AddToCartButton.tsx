import { Button } from '@/components/ui/button';

interface AddToCartButtonProps {
  stock?: number;
  onAddToCart: () => void;
}

const AddToCartButton = ({ stock, onAddToCart }: AddToCartButtonProps) => {
  const isOutOfStock = stock !== undefined && stock <= 0;

  return (
    <Button 
      className="add-to-cart-button"
      onClick={onAddToCart}
      disabled={isOutOfStock}
    >
      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;