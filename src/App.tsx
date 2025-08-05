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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
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
                <Route path="/vendor" element={<VendorDashboard />} >
                  <Route path=":id" element={<Outlet />} >
                    <Route path="dashboard" element={<ShopAnalytics />} />
                    <Route path="products" element={<VendorProductsPage />} />
                    <Route path="staff" element={<ShopStaffManagement />} />
                    <Route path="settings" element={<ShopSettings />} />
                    <Route path="orders" element={<ShopOrders />} />
                    {/* <Route path="revenue" element={<VendorRevenuePage />} />
                    <Route path="products" element={<VendorProductsPage />} /> */}
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
