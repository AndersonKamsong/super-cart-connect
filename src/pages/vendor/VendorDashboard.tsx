import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useParams } from 'react-router-dom';
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
  LogOut,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { shopService, ShopCreatePayload } from '@/services/shopService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shop } from '@/types/shop';
import { API_BASE_URL } from '@/lib/api';

export const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newShopData, setNewShopData] = useState<ShopCreatePayload>({
    name: '',
    description: '',
    logo: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: ''
    },
    contactInfo: {
      email: '',
      phone: ''
    },
    paymentMethods: {
      cash: true,
      card: false,
      mobileMoney: false
    }
  });

  const activeShop = id || null;
  const currentShop = shops.find(shop => shop._id === activeShop);

  useEffect(() => {
    fetchVendorShops();
  }, []);

  const fetchVendorShops = async () => {
    try {
      setLoading(true);
      const vendorShops = await shopService.getVendorShops();
      setShops(vendorShops.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleShopSelect = (shopId: string) => {
    navigate(`/vendor/${shopId}/dashboard`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(e.target.files[0])
      setSelectedImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    setNewShopData(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateShop = async () => {
    if (!newShopData.name || !newShopData.description) {
      toast({
        title: "Validation Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Append the image file if it exists
      if (selectedImageFile) {
        formData.append('image', selectedImageFile); // Changed from 'logo' to 'image'
      }

      // Append all other fields directly to FormData
      formData.append('name', newShopData.name);
      formData.append('description', newShopData.description);
      formData.append('address[street]', newShopData.address.street);
      formData.append('address[city]', newShopData.address.city);
      formData.append('address[state]', newShopData.address.state);
      formData.append('address[country]', newShopData.address.country);
      formData.append('contactInfo[email]', newShopData.contactInfo.email);
      formData.append('contactInfo[phone]', newShopData.contactInfo.phone);
      formData.append('paymentMethods[cash]', String(newShopData.paymentMethods.cash));
      formData.append('paymentMethods[card]', String(newShopData.paymentMethods.card));
      formData.append('paymentMethods[mobileMoney]', String(newShopData.paymentMethods.mobileMoney));

      const createdShop = await shopService.createShop(formData);
      setShops([...shops, createdShop.data]);

      // Reset form
      setCreateModalOpen(false);
      setImagePreview(null);
      setSelectedImageFile(null);
      setNewShopData({
        name: '',
        description: '',
        logo: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: ''
        },
        contactInfo: {
          email: '',
          phone: ''
        },
        paymentMethods: {
          cash: true,
          card: false,
          mobileMoney: false
        }
      });

      toast({
        title: "Success",
        description: "Shop created successfully",
      });
      handleShopSelect(createdShop.data._id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shop",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewShopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setNewShopData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.includes('contactInfo.')) {
      const contactField = name.split('.')[1];
      setNewShopData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value
        }
      }));
    } else if (name.includes('paymentMethods.')) {
      const paymentField = name.split('.')[1];
      setNewShopData(prev => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          [paymentField]: (e.target as HTMLInputElement).checked
        }
      }));
    } else {
      setNewShopData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
        <Link
          to={`/vendor/`}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
        >
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
        </Link>
        <nav className="p-4 space-y-1">
          {/* Dashboard Link */}
          {activeShop && (
            <Link
              to={`/vendor/${activeShop}/dashboard`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          )}

          {/* Management Links */}
          {activeShop && (
            <>
              <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Management
              </div>

              <Link
                to={`/vendor/${activeShop}/products`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Link>

              <Link
                to={`/vendor/${activeShop}/orders`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <BarChart2 className="h-5 w-5" />
                <span>Orders</span>
              </Link>

              <Link
                to={`/vendor/${activeShop}/staff`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <Users className="h-5 w-5" />
                <span>Staff Management</span>
              </Link>

              <Link
                to={`/vendor/${activeShop}/delivery`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <Truck className="h-5 w-5" />
                <span>Delivery Personnel</span>
              </Link>

              <Link
                to={`/vendor/${activeShop}/revenue`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <DollarSign className="h-5 w-5" />
                <span>Revenue</span>
              </Link>

              <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </div>

              <Link
                to={`/vendor/${activeShop}/settings`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </>
          )}

          {/* Shops Section */}
          <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Shops
          </div>

          {shops.map((shop) => (
            <button
              key={shop._id}
              onClick={() => handleShopSelect(shop._id)}
              className={`w-full flex items-center justify-between space-x-3 p-2 rounded-lg text-left 
                ${activeShop === shop._id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <div className="flex items-center space-x-3">
                <Store className="h-5 w-5" />
                <span>{shop.name}</span>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {shop.products?.length || 0} items
              </span>
            </button>
          ))}

          <button
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-primary mt-2"
            onClick={() => setCreateModalOpen(true)}
          >
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
              {currentShop?.name || 'Select a shop'}
            </h2>
          </div>

          {activeShop && (
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Support
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Shop
              </Button>
            </div>
          )}
        </header>

        {/* Dashboard content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : activeShop ? (
            <Outlet context={{ shop: currentShop, refreshShops: fetchVendorShops }} />
          ) : (
            shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shops.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => handleShopSelect(shop._id)}
                    className={`w-full flex flex-col items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-200 ease-in-out
                      ${activeShop === shop._id ? 'bg-primary/10 text-primary border-primary' : 'bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'}`}
                  >
                    <img
                      src={`${API_BASE_URL}/../uploads/shops/${shop.logo}`}
                      alt={`Shop ${shop.name}`}
                      className="w-full h-32 object-cover rounded-md mb-2"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/400x200/e0e0e0/000000?text=${shop.name.charAt(0)}`;
                      }}
                    />
                    <div className="flex items-center space-x-3">
                      <Store className="h-5 w-5" />
                      <span className="font-medium text-lg">{shop.name}</span>
                    </div>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-gray-500">{shop.products?.length || 0} products</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
                <Store className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No shops found</h3>
                <p className="text-gray-500 mt-1">
                  Please create your first shop to get started
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Shop
                </Button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Create Shop Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 h-[80vh] overflow-auto" >
            {/* Logo Upload */}
            <div>
              <Label>Shop Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Shop logo preview"
                        className="w-32 h-32 rounded-md object-cover border"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-32 h-32 rounded-md border border-dashed flex items-center justify-center bg-gray-50">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 500x500px
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Shop Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={newShopData.name}
                  onChange={handleNewShopChange}
                  placeholder="Enter shop name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newShopData.description}
                  onChange={handleNewShopChange}
                  placeholder="Enter shop description"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="address.street"
                    value={newShopData.address.street}
                    onChange={handleNewShopChange}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    name="address.city"
                    value={newShopData.address.city}
                    onChange={handleNewShopChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="address.state"
                    value={newShopData.address.state}
                    onChange={handleNewShopChange}
                    placeholder="Enter state or province"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country*</Label>
                  <Input
                    id="country"
                    name="address.country"
                    value={newShopData.address.country}
                    onChange={handleNewShopChange}
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <Label>Contact Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="contactInfo.email"
                    type="email"
                    value={newShopData.contactInfo.email}
                    onChange={handleNewShopChange}
                    placeholder="Enter contact email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="contactInfo.phone"
                    value={newShopData.contactInfo.phone}
                    onChange={handleNewShopChange}
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label>Payment Methods</Label>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cash"
                    name="paymentMethods.cash"
                    checked={newShopData.paymentMethods.cash}
                    onChange={handleNewShopChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="card"
                    name="paymentMethods.card"
                    checked={newShopData.paymentMethods.card}
                    onChange={handleNewShopChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mobileMoney"
                    name="paymentMethods.mobileMoney"
                    checked={newShopData.paymentMethods.mobileMoney}
                    onChange={handleNewShopChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="mobileMoney">Mobile Money</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateShop}
                disabled={loading || !newShopData.name || !newShopData.description || !newShopData.address.city || !newShopData.address.country}
              >
                {loading ? 'Creating...' : 'Create Shop'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};