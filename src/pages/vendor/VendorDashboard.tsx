import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Store,
    Users,
    Package,
    Truck,
    Settings,
    Plus,
    Menu,
    X,
    BarChart2,
    DollarSign,
    MessageSquare,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [activeShop, setActiveShop] = useState<string | null>(null);

    // Sample data - replace with actual API calls
    const shops = [
        { id: '1', name: 'Fashion Haven', products: 42, orders: 128 ,imageUrl:""},
        { id: '2', name: 'Tech Gadgets', products: 87, orders: 256 ,imageUrl:""},
        { id: '3', name: 'Home Essentials', products: 35, orders: 92 ,imageUrl:""},
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                >
                    {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed md:relative w-64 h-[95vh] bg-white border-r transition-all duration-300 ease-in-out 
        ${mobileNavOpen ? 'left-0' : '-left-64'} md:left-0 z-40`}
                style={{ overflow: "auto" }}
            >
                <div className="p-4 border-b h-16 flex items-center">
                    <h1 className="text-xl font-bold text-primary">Vendor Portal</h1>
                </div>

                <div className="p-4 border-b">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-500">Vendor Account</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        to="/vendor"
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>

                    {activeShop && (
                        <>
                            <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Management
                            </div>

                            <Link
                                to="/vendor/products"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <Package className="h-5 w-5" />
                                <span>Products</span>
                            </Link>

                            <Link
                                to="/vendor/orders"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <BarChart2 className="h-5 w-5" />
                                <span>Orders</span>
                            </Link>

                            <Link
                                to="/vendor/staff"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <Users className="h-5 w-5" />
                                <span>Staff Management</span>
                            </Link>

                            <Link
                                to="/vendor/delivery"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <Truck className="h-5 w-5" />
                                <span>Delivery Personnel</span>
                            </Link>

                            <Link
                                to="/vendor/revenue"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <DollarSign className="h-5 w-5" />
                                <span>Revenue</span>
                            </Link>

                            <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Settings
                            </div>

                            <Link
                                to="/vendor/settings"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
                            >
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </Link>
                        </>
                    )}
                    <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        My Shops
                    </div>

                    {shops.map((shop) => (
                        <button
                            key={shop.id}
                            onClick={() => setActiveShop(shop.id)}
                            className={`w-full flex items-center justify-between space-x-3 p-2 rounded-lg text-left 
              ${activeShop === shop.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <Store className="h-5 w-5" />
                                <span>{shop.name}</span>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {shop.products} items
                            </span>
                        </button>
                    ))}
                    <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-primary mt-2">
                        <Plus className="h-5 w-5" />
                        <span>Add New Shop</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 mt-4"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Log Out</span>
                    </button>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {/* Top navigation */}
                <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold">
                            {activeShop
                                ? shops.find(s => s.id === activeShop)?.name
                                : 'Select a shop'}
                        </h2>
                        {activeShop && (
                            <span className="text-sm text-gray-500">
                                {shops.find(s => s.id === activeShop)?.orders} orders this month
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Support
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Product
                        </Button>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="p-6">
                    {activeShop ? (
                        // If an active shop is selected, render the Outlet content
                        <Outlet />
                    ) : (
                        // If no active shop is selected, check if there are any shops in the list
                        shops.length > 0 ? (
                            // If shops exist, map through them to display shop buttons
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Added a grid for multiple cards */}
                                {shops.map((shop) => (
                                    <button
                                        key={shop.id}
                                        onClick={() => setActiveShop(shop.id)}
                                        className={`w-full flex flex-col items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-200 ease-in-out
                  ${activeShop === shop.id ? 'bg-primary/10 text-primary border-primary' : 'bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'}`}
                                    >
                                        {/* Shop Image (placeholder) */}
                                        <img
                                            src={shop.imageUrl || `https://placehold.co/400x200/e0e0e0/000000?text=${shop.name.charAt(0)}`} // Use shop.imageUrl or a placeholder
                                            alt={`Shop ${shop.name}`}
                                            className="w-full h-32 object-cover rounded-md mb-2"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/e0e0e0/000000?text=${shop.name.charAt(0)}`; }} // Fallback on error
                                        />
                                        <div className="flex items-center space-x-3">
                                            <Store className="h-5 w-5" />
                                            <span className="font-medium text-lg">{shop.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {shop.products} items
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // If no shops exist, display the "No shop selected" message and "Create New Shop" button
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
                                <Store className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No shop Found</h3>
                                <p className="text-gray-500 mt-1">
                                    Please create a new one
                                </p>
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Shop
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};