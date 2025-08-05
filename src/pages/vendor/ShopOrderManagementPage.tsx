import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types/order';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export const ShopOrders = () => {
    const { id } = useParams();
    const shopId = id;
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

    const statusOptions: OrderStatus[] = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ];

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getShopOrders(shopId!, {
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            setOrders(data.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch orders',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [shopId, statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setIsUpdating(prev => ({ ...prev, [orderId]: true }));
            await orderService.updateOrderStatus(orderId, { status: newStatus });

            setOrders(prev => prev.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));

            toast({
                title: 'Success',
                description: 'Order status updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Order Management</h1>
                    <p className="text-muted-foreground">
                        View and manage all orders for your shop
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                        <TableCell>{order.customerName || 'Guest'}</TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                                        <TableCell>{formatCurrency(order.total)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={order.status}
                                                onValueChange={(value: OrderStatus) => handleStatusChange(order._id, value)}
                                                disabled={isUpdating[order._id]}
                                            >
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Change status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map(status => (
                                                        <SelectItem key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};