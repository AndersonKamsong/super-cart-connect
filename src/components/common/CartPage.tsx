import { useCart } from '@/contexts/CartContext';
import { API_BASE_URL } from '@/lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// import { useCart } from '../contexts/CartContext';

const CartPage = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const handleCheckout = () => {
        setIsCheckoutLoading(true);
        if (totalItems > 0) {
            navigate('/order')
        } else {
            toast({
                title: "Error",
                description: "Can not Proceed if Cart is empty",
                variant: "destructive",
            });
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <a
                    href="/products"
                    className="px-6 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Continue Shopping
                </a>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart ({totalItems})</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    {cartItems.map((item) => (
                        <div
                            key={`${item.productId}-${item.variantId || ''}`}
                            className="flex flex-col sm:flex-row gap-4 py-6 border-b border-gray-200"
                        >
                            <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                    src={`${API_BASE_URL}/../uploads/products/${item.image}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-medium text-lg">{item.name}</h3>
                                {item.variantId && (
                                    <p className="text-gray-600 text-sm">Variant: {item.variantId}</p>
                                )}
                                <p className="text-gray-800 font-medium mt-1">${item.price.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => updateQuantity(
                                            item.productId,
                                            item.shopId,
                                            item.variantId,
                                            item.quantity - 1
                                        )}
                                        disabled={item.quantity <= 1}
                                        className="px-3 py-1 disabled:opacity-50"
                                    >
                                        -
                                    </button>

                                    <span className="px-3">{item.quantity}</span>

                                    <button
                                        onClick={() => updateQuantity(
                                            item.productId,
                                            item.shopId,
                                            item.variantId,
                                            item.quantity + 1
                                        )}
                                        className="px-3 py-1"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.productId,item.shopId, item.variantId)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-lg">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a
                                href="/products"
                                className="block text-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Continue Shopping
                            </a>
                            <button
                                onClick={clearCart}
                                className="w-full px-4 py-2 text-red-500 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckoutLoading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {isCheckoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;