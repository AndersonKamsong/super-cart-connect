import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { shopService } from '@/services/shopService';
import { ShopStats } from '@/types/shop';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const ShopAnalytics = () => {
    const { id } = useParams();
    const shopId = id;
    const { toast } = useToast();
    const [stats, setStats] = useState<ShopStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await shopService.getShopStats(shopId!);
                console.log(data);
                setStats(data.data);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load shop statistics',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [shopId, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return <div>No statistics available</div>;
    }

    // Ensure we have proper data structures for the charts
    const monthlySalesData = {
        labels: stats.monthlySales.map(item => item.month),
        datasets: [
            {
                label: 'Monthly Revenue',
                data: stats.monthlySales.map(item => item.revenue),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }
        ]
    };

    const productInventoryData = {
        labels: stats.topProducts.map(item => item.name),
        datasets: [
            {
                label: 'Inventory Count',
                data: stats.topProducts.map(item => item.inventoryCount),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart',
            },
        },
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Shop Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.overview.totalProducts}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.overview.totalOrders}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${stats.overview.totalRevenue.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Sales Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.monthlySales.length > 0 ? (
                        <Line 
                            data={monthlySalesData} 
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                        ...chartOptions.plugins.title,
                                        text: 'Monthly Sales Revenue'
                                    }
                                }
                            }} 
                        />
                    ) : (
                        <div className="text-center py-8">No monthly sales data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Product Inventory Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.topProducts.length > 0 ? (
                        <Bar 
                            data={productInventoryData} 
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                        ...chartOptions.plugins.title,
                                        text: 'Top Products by Inventory'
                                    }
                                }
                            }} 
                        />
                    ) : (
                        <div className="text-center py-8">No product inventory data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Staff Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.staffPerformance.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Orders Processed</th>
                                    <th>Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.staffPerformance.map(staff => (
                                    <tr key={staff.staffId}>
                                        <td>{staff.name} ({staff.email})</td>
                                        <td>{staff.orderCount}</td>
                                        <td>${staff.totalRevenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8">No staff performance data available</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};