import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Store,
  Shield,
  Truck,
  Search,
  Menu
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';

export const Header: React.FC = () => {
  const { totalItems,cartItems } = useCart();
  const { user, logout, isAuthenticated, isAdmin, isVendor, isDelivery } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  console.log("cartItems",cartItems)
  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isVendor) return '/vendor';
    if (isDelivery) return '/delivery';
    return '/profile';
  };

  const getUserInitials = () => {
    return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary hidden sm:inline-block">SuperShop</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Products
          </Link>
          <Link to="/categories" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Categories
          </Link>
          <Link to="/shops" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Shops
          </Link>
          {isAuthenticated && (
            <Link to="/my-orders" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Search Button - Mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:inline-flex"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Shopping Cart */}
              {!isDelivery && !isAdmin && (
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {totalItems}
                    </Badge>
                  </Link>
                </Button>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-destructive">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {isVendor && (
                          <Badge variant="secondary" className="text-xs">
                            <Store className="h-3 w-3 mr-1" />
                            Vendor
                          </Badge>
                        )}
                        {isDelivery && (
                          <Badge variant="secondary" className="text-xs">
                            <Truck className="h-3 w-3 mr-1" />
                            Delivery
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="px-4 py-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full"
              />
            </div>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/products"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/shops"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shops
              </Link>
              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/auth/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};