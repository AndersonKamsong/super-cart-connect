import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { VendorDashboard } from "./pages/vendor/VendorDashboard";
import { VendorProductsPage } from "./pages/vendor/VendorProductsPage";
import { ShopStaffManagement } from "./pages/vendor/ShopStaffManagement";
import { ShopSettings } from "./pages/vendor/ShopSettings";
import { ShopOrders } from "./pages/vendor/ShopOrderManagementPage";
import { ShopAnalytics } from "./pages/vendor/ShopAnalytics";
import ProductListPage from "./pages/common/ProductPage";
import { CartProvider } from "./contexts/CartContext";
import ProductDetailPage from "./pages/common/ProductDetailPage";
import CategoriesPage from "./pages/common/CategoriesPage";
import CategoryDetailPage from "./pages/common/CategoryDetailPage";
import ShopsPage from "./pages/common/ShopsPage";
import ShopDetailPage from "./pages/common/ShopDetailPage";
import CartPage from "./components/common/CartPage";
import CheckoutPage from "./pages/common/Checkout";
import CustomerOrdersPage from "./pages/common/CustomerOrderPage";
import OrderDetailPage from "./pages/common/OrderDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Outlet />} >
                    <Route index element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="*" element={<LoginPage />} />
                  </Route>
                  <Route path="cart" element={<CartPage />} />
                  <Route path="order" element={<CheckoutPage />} />
                  <Route path="products" element={<Outlet />} >
                    <Route index element={<ProductListPage />} />
                    <Route path=":id" element={<ProductDetailPage />} />
                  </Route>
                  <Route path="categories" element={<Outlet />} >
                    <Route index element={<CategoriesPage />} />
                    <Route path=":id" element={<CategoryDetailPage />} />
                  </Route>
                  <Route path="shops" element={<Outlet />} >
                    <Route index element={<ShopsPage />} />
                    <Route path=":id" element={<ShopDetailPage />} />
                  </Route>
                   <Route path="my-orders" element={<Outlet />} >
                    <Route index element={<CustomerOrdersPage />} />
                    <Route path=":id" element={<OrderDetailPage />} />
                  </Route>
                  <Route path="/vendor" element={<VendorDashboard />} >
                    <Route path=":id" element={<Outlet />} >
                      <Route path="dashboard" element={<ShopAnalytics />} />
                      <Route path="products" element={<VendorProductsPage />} />
                      <Route path="staff" element={<ShopStaffManagement />} />
                      <Route path="settings" element={<ShopSettings />} />
                      <Route path="orders" element={<ShopOrders />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
