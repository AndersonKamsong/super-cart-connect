import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageIcon, Box, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductFormValues } from '@/types/products';
import { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { API_BASE_URL } from '@/lib/api';
import { Category } from '@/types/category';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  costPrice: z.number().optional(),
  stock: z.number().min(0, 'Stock must be positive'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  images: z.array(
    z.union([
      z.instanceof(File),
      z.object({
        url: z.string(),
        alt: z.string().optional(),
      }),
    ])
  ),
  // Add 3D models field to the schema
  models3D: z.array(
    z.union([
      z.instanceof(File),
      z.object({
        url: z.string(),
        name: z.string().optional(),
        format: z.string().optional(),
      }),
    ])
  ).optional(),
  variants: z.array(z.object({
    options: z.record(z.string()),
    price: z.number(),
    stock: z.number(),
    sku: z.string().optional(),
  })).optional(),
});

interface ProductFormProps {
  initialValues?: any;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  removedImages;
  setRemovedImages;
  files;
  setFiles;
  // Add props for 3D models
  removedModels;
  setRemovedModels;
  modelFiles;
  setModelFiles;
}

export const ProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  removedImages,
  setRemovedImages,
  files,
  setFiles,
  removedModels,
  setRemovedModels,
  modelFiles,
  setModelFiles,
}: ProductFormProps) => {
  const { toast } = useToast();
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const categoryList = await categoryService.getCategories();
      console.log("categoryList.data",categoryList.data)
      setCategories(categoryList.data);
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
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      price: initialValues?.price || 0,
      comparePrice: initialValues?.comparePrice || undefined,
      costPrice: initialValues?.costPrice || undefined,
      stock: initialValues?.stock || 0,
      sku: initialValues?.sku || '',
      barcode: initialValues?.barcode || '',
      category: initialValues?.category
        ? typeof initialValues.category === 'string'
          ? initialValues.category
          : initialValues.category._id
        : '',
      tags: initialValues?.tags || [],
      isActive: initialValues?.isActive ?? true,
      isFeatured: initialValues?.isFeatured ?? false,
      isBestseller: initialValues?.isBestseller ?? false,
      images: initialValues?.images || [],
      models3D: initialValues?.models3D || [],
      variants: initialValues?.variants || [],
    },
  });

  const handleImageUpload = (newFiles: File[]) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);

    // Add to form values
    form.setValue('images', [
      ...form.getValues('images'),
      ...newFiles.map(file => ({
        url: URL.createObjectURL(file),
        alt: file.name,
        file: file,
      }))
    ]);
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    const currentImages = form.getValues('images');

    if (isExisting) {
      if (typeof currentImages[index] === 'object' && 'url' in currentImages[index]) {
        setRemovedImages([...removedImages, (currentImages[index] as { url: string }).url]);
      }
    } else {
      const newFiles = [...files];
      newFiles.splice(index - (currentImages.length - files.length), 1);
      setFiles(newFiles);
    }

    form.setValue(
      'images',
      currentImages.filter((_, i) => i !== index)
    );
  };

  // Handle 3D model upload
  const handleModelUpload = (newFiles: File[]) => {
    const updatedModelFiles = [...modelFiles, ...newFiles];
    setModelFiles(updatedModelFiles);

    // Add to form values
    form.setValue('models3D', [
      ...(form.getValues('models3D') || []),
      ...newFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        format: file.name.split('.').pop(),
        file: file,
      }))
    ]);
  };

  // Handle 3D model removal
  const handleRemoveModel = (index: number, isExisting: boolean) => {
    const currentModels = form.getValues('models3D') || [];

    if (isExisting) {
      if (typeof currentModels[index] === 'object' && 'url' in currentModels[index]) {
        setRemovedModels([...removedModels, (currentModels[index] as { url: string }).url]);
      }
    } else {
      const newModelFiles = [...modelFiles];
      newModelFiles.splice(index - (currentModels.length - modelFiles.length), 1);
      setModelFiles(newModelFiles);
    }

    form.setValue(
      'models3D',
      currentModels.filter((_, i) => i !== index)
    );
  };

  // Get file icon based on file format
  const getModelIcon = (format: string | undefined) => {
    switch (format?.toLowerCase()) {
      case 'glb':
      case 'gltf':
        return '🗿'; // Stone statue emoji for GL formats
      case 'obj':
        return '🔺'; // Triangle emoji for OBJ
      case 'fbx':
        return '🎬'; // Clapper board emoji for FBX
      case 'stl':
        return '🖨️'; // 3D printer emoji for STL
      default:
        return '📦'; // Box emoji for other formats
    }
  };

  // Handle form submission with better error handling
  const handleFormSubmit = async (data: ProductFormValues) => {
    console.log('Form submitted with data:', data);
    
    // Check if there are any validation errors
    const isValid = await form.trigger();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      const errors = form.formState.errors;
      // console.log('Form errors:', form.images);
      console.log('Form errors:', errors);
      setFormErrors(Object.values(errors).map(error => error.message || 'Validation error'));
      
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setFormErrors([]);
    
    try {
      console.log('Calling onSubmit with data:', data);
      await onSubmit(data);
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit the form",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e)=>{
        e.preventDefault()
        console.log("submit")
        form.handleSubmit(onSubmit)
        handleFormSubmit(form)
      }} className="space-y-6 h-[80vh] overflow-auto">
      {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-[80vh] overflow-auto"> */}
        {/* Display form errors at the top */}
        {formErrors.length > 0 && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            <h3 className="font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <FormLabel>Product Images</FormLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {form.watch('images').map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={
                        image?.url?.startsWith('blob:')
                          ? image.url
                          : `${API_BASE_URL}/../uploads/products/${image.url}`
                      }
                      alt={image.alt || 'Product Image'}
                      className="aspect-square w-full rounded-md object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, !image?.url?.startsWith('blob:'))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files))}
                  />
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm">Add Image</span>
                  </div>
                </label>
              </div>
              <FormMessage>
                {form.formState.errors.images?.message}
              </FormMessage>
            </div>

            {/* 3D Models Section */}
            <div className="pt-4">
              <FormLabel>3D Models</FormLabel>
              <div className="mt-2 space-y-2">
                {(form.watch('models3D') || []).map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md group">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {getModelIcon(
                          typeof model === 'object' && 'format' in model 
                            ? model.format 
                            : model instanceof File 
                              ? model.name.split('.').pop() 
                              : undefined
                        )}
                      </span>
                      <div className="text-sm truncate max-w-[120px]">
                        {typeof model === 'object' && 'name' in model 
                          ? model.name 
                          : model instanceof File 
                            ? model.name 
                            : '3D Model'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(
                        index, 
                        typeof model === 'object' && 'url' in model && !model.url.startsWith('blob:')
                      )}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex w-full items-center justify-center p-3 border border-dashed rounded-md cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".glb,.gltf,.obj,.fbx,.stl,.3ds"
                    onChange={(e) => e.target.files && handleModelUpload(Array.from(e.target.files))}
                  />
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Box className="h-5 w-5" />
                    <span className="text-sm">Add 3D Model</span>
                  </div>
                </label>
              </div>
              <FormMessage>
                {form.formState.errors.models3D?.message}
              </FormMessage>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: GLB, GLTF, OBJ, FBX, STL
              </p>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="md:col-span-2 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comparePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(item => (
                        <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tag1, tag2, tag3"
                      {...field}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0);
                        field.onChange(tags);
                      }}
                      value={field.value?.join(', ') || ''}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Featured</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isBestseller"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Bestseller</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
};