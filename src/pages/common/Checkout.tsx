// pages/checkout.tsx
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';
// import { useRouter } from 'next/router';

const CheckoutPage = () => {
    const { cartItems, totalPrice, clearCart, groupItemsByShop } = useCart();
    const router = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
        },
        deliveryType: 'delivery' as 'delivery' | 'pickup',
        paymentMethod: 'card' as 'cash' | 'card' | 'mobile_money',
        notes: '',
    });

    // Assume first item's shop ID for simplicity
    // In a real app, you might need to handle multiple shops
    //   const shopId = cartItems[0]?.productId || '';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('shippingAddress.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                shippingAddress: {
                    ...prev.shippingAddress,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        try {
            // Prepare order data
            const shopOrders = groupItemsByShop();
            console.log(shopOrders)
            console.log(formData)

            const orderData = {
                shopOrders,
                shippingAddress: formData.shippingAddress,
                deliveryType: formData.deliveryType,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                // These could be calculated or set from shop settings
                tax: 0,
                deliveryFee: formData.deliveryType === 'delivery' ? 5 : 0,
                discount: 0,
            };

            // Create order
              const order = await orderService.createOrder(orderData);

            // Clear cart on success
              clearCart();

            // Redirect to order confirmation
              router(`/orders/${order._id}`);
        } catch (err) {
            console.error('Checkout failed:', err);
            setError('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="mb-6">There are no items to checkout.</p>
                <button
                    onClick={() => router('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Order Summary */}
                <div className="lg:w-2/5">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cartItems.map(item => (
                                <div key={`${item.productId}`} className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.quantity} × ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>
                                    {formData.deliveryType === 'delivery' ? '$5.00' : 'Free'}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2">
                                <span>Total</span>
                                <span>
                                    ${(totalPrice + (formData.deliveryType === 'delivery' ? 5 : 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="lg:w-3/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Delivery Method */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-medium mb-2">Delivery Method</legend>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="delivery"
                                        checked={formData.deliveryType === 'delivery'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    Delivery
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="pickup"
                                        checked={formData.deliveryType === 'pickup'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    Pickup
                                </label>
                            </div>
                        </fieldset>

                        {/* Shipping Address */}
                        {formData.deliveryType === 'delivery' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Shipping Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="street" className="block text-sm font-medium mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="shippingAddress.street"
                                            value={formData.shippingAddress.street}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="shippingAddress.city"
                                            value={formData.shippingAddress.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium mb-1">
                                            State/Province
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="shippingAddress.state"
                                            value={formData.shippingAddress.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                                            ZIP/Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="shippingAddress.zipCode"
                                            value={formData.shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="shippingAddress.country"
                                            value={formData.shippingAddress.country}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-medium mb-2">Payment Method</legend>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 p-3 border rounded-md">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    Credit/Debit Card
                                </label>
                                <label className="flex items-center gap-2 p-3 border rounded-md">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="mobile_money"
                                        checked={formData.paymentMethod === 'mobile_money'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    Mobile Money
                                </label>
                                <label className="flex items-center gap-2 p-3 border rounded-md">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    Cash on Delivery
                                </label>
                            </div>
                        </fieldset>

                        {/* Order Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium mb-1">
                                Order Notes (Optional)
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {isProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;