// pages/orders/index.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '@/types/order';

const CustomerOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!user) return;

                setLoading(true);
                const customerOrders = await orderService.getCustomerOrders(user._id);
                console.log(customerOrders)
                setOrders(customerOrders.data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                setError('Failed to load your orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order =>
            order.shopOrders.some(shopOrder => shopOrder.status === filter)
        );

    const getOrderStatus = (order: Order) => {
        const statuses = order.shopOrders.map(so => so.status);

        if (statuses.includes('cancelled')) return 'cancelled';
        if (statuses.includes('processing')) return 'processing';
        if (statuses.every(s => s === 'delivered')) return 'delivered';
        if (statuses.some(s => s === 'shipped')) return 'shipped';
        return 'pending';
    };

    const getEarliestDeliveryDate = (order: Order) => {
        // In a real app, this would come from the backend
        const now = new Date();
        const deliveryDate = new Date(order.createdAt);
        deliveryDate.setDate(deliveryDate.getDate() + 3); // Add 3 days as example
        return deliveryDate.toLocaleDateString();
    };

    const handleOrderClick = (orderId: string) => {
        navigate(`/orders/${orderId}`);
    };

    if (!user) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                <p className="mb-6">You need to be signed in to view your orders.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Sign In
                </button>
            </div>
        );
    }

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
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">No Orders Found</h1>
                <p className="mb-6">You haven't placed any orders yet.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Your Orders</h1>

                <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Filter:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
                        className="p-2 border rounded-md"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        onClick={() => handleOrderClick(order._id)}
                        className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-2 sm:mb-0">
                                <h2 className="font-bold text-lg">Order #{order.orderNumber}</h2>
                                <p className="text-gray-600 text-sm">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatus(order) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        getOrderStatus(order) === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            getOrderStatus(order) === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                getOrderStatus(order) === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                    }`}>
                                    {getOrderStatus(order).toUpperCase()}
                                </span>
                                <span className="font-bold">${order.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="p-4">
                            {order.shopOrders.map((shopOrder) => (
                                <div key={shopOrder.shop._id} className="mb-4 last:mb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium">
                                            Shop: {typeof shopOrder.shop === 'string' ? shopOrder.shop : shopOrder.shop.name}
                                        </h3>
                                        <span className={`text-sm ${shopOrder.status === 'delivered' ? 'text-green-600' :
                                                shopOrder.status === 'cancelled' ? 'text-red-600' :
                                                    'text-blue-600'
                                            }`}>
                                            {shopOrder.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {shopOrder.items.map((item) => (
                                            <div key={`${item.product}-${shopOrder.shop}`} className="flex">
                                                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
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
                                                    <p className="text-gray-600 text-sm">
                                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p>${item.totalPrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {shopOrder.deliveryType === 'delivery'
                                                    ? `Estimated delivery: ${getEarliestDeliveryDate(order)}`
                                                    : 'Ready for pickup'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm">Subtotal: ${shopOrder.subtotal.toFixed(2)}</p>
                                            {shopOrder.deliveryFee > 0 && (
                                                <p className="text-sm">Delivery: ${shopOrder.deliveryFee.toFixed(2)}</p>
                                            )}
                                            <p className="font-medium">
                                                Shop Total: ${shopOrder.total.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {order.shopOrders.length} {order.shopOrders.length === 1 ? 'shop' : 'shops'}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/my-orders/${order._id}`);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerOrdersPage;