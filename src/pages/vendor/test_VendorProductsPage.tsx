import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductFormValues } from '@/types/products';
import { API_BASE_URL } from '@/lib/api';

export const VendorProductsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // Add state for 3D models
  const [removedModels, setRemovedModels] = useState<string[]>([]);
  const [modelFiles, setModelFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchShopProducts();
  }, [id]);

  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      console.log(id)
      const shopProducts = await productService.getShopProducts(id!);
      console.log(shopProducts.data)
      setProducts(shopProducts.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFiles([]);
    setModelFiles([]);
    setRemovedImages([]);
    setRemovedModels([]);
    setIsFormOpen(true);
  };

  const handleAddProduct = () => {
    setFiles([]);
    setModelFiles([]);
    setRemovedImages([]);
    setRemovedModels([]);
    setCurrentProduct(null);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchShopProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      await productService.toggleProductStatus(productId);
      toast({
        title: "Success",
        description: "Product status updated",
      });
      fetchShopProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
    // Fetch the blob from the blob URL
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    // Get the file type from the blob
    const extension = blob.type.split('/')[1] || 'png';
    const actualFilename = filename.endsWith(extension)
      ? filename
      : `${filename}.${extension}`;

    // Convert blob to File
    return new File([blob], actualFilename, { type: blob.type });
  }

  const handleFormSubmit = async (values: ProductFormValues) => {
    try {
      console.log("here")
      setIsSubmitting(true);
      const formData = new FormData();

      // 1. Handle images
      const imageFiles: File[] = files;
      const existingImages: Array<{ url: string, alt?: string }> = [];
      
      values.images.forEach(async image => {
        if (image instanceof File) {
          // imageFiles.push(image);
        } else if (typeof image === 'object' && image.url) {
          // Convert blob URLs to Files if needed
          if (image?.url?.startsWith('blob:')) {
            const file = await blobUrlToFile(image.url, image.alt || 'product-image');
            // imageFiles.push(file);
          } else {
            existingImages.push(image);
          }
        }
      });

      // Append new image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Append existing images
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // 2. Handle 3D models
      const modelFilesToUpload: File[] = modelFiles;
      const existingModels: Array<{ url: string, name?: string, format?: string }> = [];
      
      if (values.models3D) {
        values.models3D.forEach(async model => {
          if (model instanceof File) {
            // modelFilesToUpload.push(model);
          } else if (typeof model === 'object' && model.url) {
            // Convert blob URLs to Files if needed
            if (model?.url?.startsWith('blob:')) {
              const file = await blobUrlToFile(model.url, model.name || '3d-model');
              // modelFilesToUpload.push(file);
            } else {
              existingModels.push(model);
            }
          }
        });
      }

      // Append new 3D model files
      modelFilesToUpload.forEach(file => {
        formData.append('models3D', file);
      });

      // Append existing 3D models
      if (existingModels.length > 0) {
        formData.append('existingModels', JSON.stringify(existingModels));
      }

      // 3. Append all other fields
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'models3D') { // We've already handled images and models
          if (key === 'variants' || key === 'tags') {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        }
      });

      // 4. Append removed images if any
      if (removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(removedImages));
      }

      // 5. Append removed 3D models if any
      if (removedModels.length > 0) {
        formData.append('removedModels', JSON.stringify(removedModels));
      }

      // 6. Add shop ID for new products
      if (!currentProduct && id) {
        formData.append('shop', id);
      }

      // 7. Set headers and submit
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (currentProduct) {
        await productService.updateProduct(currentProduct._id, formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await productService.createProduct(formData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setIsFormOpen(false);
      fetchShopProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className='h-[80hv] overflow-auto'>
            <ProductForm
              initialValues={currentProduct || undefined}
              removedImages={removedImages}
              setRemovedImages={setRemovedImages}
              files={files}
              setFiles={setFiles}
              removedModels={removedModels}
              setRemovedModels={setRemovedModels}
              modelFiles={modelFiles}
              setModelFiles={setModelFiles}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Product List Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortConfig?.key === 'name' && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-2">
                  Price
                  {sortConfig?.key === 'price' && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  {sortConfig?.key === 'stock' && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('isActive')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortConfig?.key === 'isActive' && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <img
                        src={`${API_BASE_URL}/../uploads/products/${product.images[0].url}`}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // prevent infinite loop
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center" style={{ display: product.images?.[0] ? 'none' : 'flex' }}>
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>

                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                      <span>{product.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate(`/products/${product._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(product._id)}>
                          {product.isActive ? (
                            <ToggleLeft className="h-4 w-4 mr-2" />
                          ) : (
                            <ToggleRight className="h-4 w-4 mr-2" />
                          )}
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};