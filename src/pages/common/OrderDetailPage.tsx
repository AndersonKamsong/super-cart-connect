// pages/orders/[id].tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types/order';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!id) return;

                setLoading(true);
                const orderData = await orderService.getOrder(id);
                // console.log("orderData",orderData)
                // console.log("orderData",user)
                // Check if user is authorized to view this order
                // if (orderData?.customer?._id?.toString() !== user?._id && user?.role !== 'admin') {
                //   throw new Error('Not authorized to view this order');
                // }

                setOrder(orderData.data);
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user]);

    const handleCancelShopOrder = async (shopId: string) => {
        try {
            if (!order || !id) return;

            // In a real app, you would call orderService.updateOrderStatus
            // This is just for demonstration
            const updatedOrder = {
                ...order,
                shopOrders: order.shopOrders.map(so =>
                    so.shop._id === shopId
                        ? { ...so, status: 'cancelled' }
                        : so
                )
            };

            setOrder(updatedOrder);
            // await orderService.updateOrderStatus(id, { status: 'cancelled' });
        } catch (err) {
            console.error('Failed to cancel order:', err);
            setError('Failed to cancel order. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 text-center">
                <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/my-orders')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <p className="mb-6">We couldn't find the order you're looking for.</p>
                <button
                    onClick={() => navigate('/my-orders')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/my-orders')}
                className="flex items-center text-blue-600 mb-6"
            >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Orders
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
                    <p className="text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} •
                        Payment Method: {order?.paymentMethod?.toUpperCase()}
                    </p>
                </div>

                <div className="mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.shopOrders.some(so => so.status === 'pending') ? 'bg-yellow-100 text-yellow-800' :
                            order.shopOrders.some(so => so.status === 'processing') ? 'bg-blue-100 text-blue-800' :
                                order.shopOrders.some(so => so.status === 'shipped') ? 'bg-purple-100 text-purple-800' :
                                    order.shopOrders.every(so => so.status === 'delivered') ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                        }`}>
                        {order.shopOrders.every(so => so.status === 'delivered')
                            ? 'COMPLETED'
                            : order.shopOrders.some(so => so.status === 'cancelled')
                                ? 'PARTIALLY CANCELLED'
                                : 'IN PROGRESS'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold mb-4">Order Details</h2>

                            {order.shopOrders.map((shopOrder) => (
                                <div key={shopOrder.shop._id} className="mb-6 last:mb-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold">
                                            {typeof shopOrder.shop === 'string' ? shopOrder.shop : shopOrder.shop.name}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs ${shopOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                shopOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    shopOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                        shopOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                            }`}>
                                            {shopOrder.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {shopOrder.items.map((item) => (
                                            <div key={`${item.product}-${shopOrder.shop}`} className="flex border-b pb-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                    </p>
                                                    {shopOrder.status === 'delivered' && (
                                                        <button className="text-sm text-blue-600 hover:underline">
                                                            Buy it again
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium">Delivery</p>
                                                <p className="text-sm text-gray-600">
                                                    {shopOrder.deliveryType === 'delivery'
                                                        ? `Shipping to: ${shopOrder.shippingAddress?.street}, ${shopOrder.shippingAddress?.city}`
                                                        : 'Pickup at store location'}
                                                </p>
                                                {shopOrder.status !== 'cancelled' && (
                                                    <p className="text-sm mt-2">
                                                        Estimated delivery: {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">Subtotal: ${shopOrder.subtotal.toFixed(2)}</p>
                                                {shopOrder.tax > 0 && (
                                                    <p className="text-sm">Tax: ${shopOrder.tax.toFixed(2)}</p>
                                                )}
                                                {shopOrder.deliveryFee > 0 && (
                                                    <p className="text-sm">Shipping: ${shopOrder.deliveryFee.toFixed(2)}</p>
                                                )}
                                                {shopOrder.discount > 0 && (
                                                    <p className="text-sm">Discount: -${shopOrder.discount.toFixed(2)}</p>
                                                )}
                                                <p className="font-medium mt-1">
                                                    Shop Total: ${shopOrder.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {shopOrder.status !== 'cancelled' && shopOrder.status !== 'delivered' && (
                                            <div className="mt-4 flex justify-end space-x-3">
                                                <button
                                                    onClick={() => handleCancelShopOrder(shopOrder.shop._id)}
                                                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                                                >
                                                    Cancel Order
                                                </button>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                    Contact Seller
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                        {order.shopOrders.some(so => so.deliveryType === 'delivery') ? (
                            (() => {
                                const addresses = order.shopOrders
                                    .filter(so => so.deliveryType === 'delivery')
                                    .map(so => JSON.stringify(so.shippingAddress));

                                const allSame = addresses.every(addr => addr === addresses[0]);

                                if (allSame) {
                                    const shipping = order.shopOrders.find(so => so.deliveryType === 'delivery')?.shippingAddress;
                                    return (
                                        <>
                                            <p className="font-medium">{shipping?.street}</p>
                                            <p className="font-medium">
                                                {shipping?.city}, {shipping?.state} {shipping?.zipCode}
                                            </p>
                                            <p className="font-medium">{shipping?.country}</p>
                                            <button className="mt-4 text-blue-600 text-sm hover:underline">
                                                Update Shipping Address
                                            </button>
                                        </>
                                    );
                                } else {
                                    return <p>Different shipping addresses for each shop order</p>;
                                }
                            })()
                        ) : (
                            <p>Pickup orders don't require shipping address</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            {order.shopOrders.map((shopOrder) => (
                                <div key={`summary-${shopOrder.shop._id}`} className="flex justify-between">
                                    <span>
                                        {typeof shopOrder.shop === 'string' ? shopOrder.shop : shopOrder.shop.name}
                                    </span>
                                    <span>${shopOrder.total.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-3 font-bold flex justify-between">
                                <span>Total</span>
                                <span>${order.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                        <p className="mb-4">If you have any questions about your order, please contact our support team.</p>
                        <button className="w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;