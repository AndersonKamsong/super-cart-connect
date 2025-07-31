import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Star, 
  TrendingUp,
  Users,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Store,
      title: "Multi-Vendor Marketplace",
      description: "Multiple shops and vendors all in one platform"
    },
    {
      icon: Truck,
      title: "Smart Delivery System",
      description: "Shop-specific and global delivery personnel"
    },
    {
      icon: ShoppingCart,
      title: "Seamless Shopping",
      description: "Easy browsing, cart management, and checkout"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Safe payments and data protection"
    }
  ];

  const stats = [
    { label: "Active Shops", value: "500+", icon: Store },
    { label: "Happy Customers", value: "10K+", icon: Users },
    { label: "Products Available", value: "50K+", icon: Package },
    { label: "Orders Delivered", value: "25K+", icon: CheckCircle }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              🚀 Welcome to the Future of Shopping
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Ultimate
              <span className="text-primary"> Multi-Vendor</span>
              <br />
              Supermarket Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with local vendors, enjoy fresh products, and experience seamless shopping 
              with real-time order tracking and fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" className="px-8" asChild>
                    <Link to="/auth/register">Start Shopping</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8" asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="px-8" asChild>
                    <Link to="/products">Shop Now</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8" asChild>
                    <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/profile'}>
                      Go to Dashboard
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="h-8 w-8 text-primary mx-auto" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose SuperShop?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of convenience, quality, and community support
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold">Browse & Select</h3>
              <p className="text-muted-foreground">
                Explore products from multiple local vendors and add them to your cart
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold">Order & Pay</h3>
              <p className="text-muted-foreground">
                Secure checkout with multiple payment options and order confirmation
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold">Track & Receive</h3>
              <p className="text-muted-foreground">
                Real-time tracking and fast delivery right to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who trust SuperShop for their daily needs
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8" asChild>
                  <Link to="/auth/register">Get Started Today</Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8" asChild>
                  <Link to="/shops">Explore Shops</Link>
                </Button>
              </div>
            ) : (
              <Button size="lg" className="px-8" asChild>
                <Link to="/products">Start Shopping</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
