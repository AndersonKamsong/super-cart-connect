// components/ShopSettings.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { shopService } from '@/services/shopService';
import { Shop, UpdateShopDto } from '@/types/shop';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const shopSettingsSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    logo: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().optional(),
        country: z.string().min(1, 'Country is required'),
    }),
    contactInfo: z.object({
        email: z.string().email('Invalid email'),
        phone: z.string().optional(),
    }),
    paymentMethods: z.object({
        cash: z.boolean(),
        card: z.boolean(),
        mobileMoney: z.boolean(),
    }),
});

export const ShopSettings = () => {
    const { id } = useParams();
    const shopId = id;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');

    const form = useForm<z.infer<typeof shopSettingsSchema>>({
        resolver: zodResolver(shopSettingsSchema),
        defaultValues: {
            name: '',
            description: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
            },
            contactInfo: {
                email: '',
                phone: '',
            },
            paymentMethods: {
                cash: true,
                card: false,
                mobileMoney: false,
            },
        },
    });

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setIsLoading(true);
                const shop = await shopService.getShop(shopId!);
                console.log(shop)
                form.reset(shop.data);
                setLogoPreview(shop?.data?.logo || '');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load shop data',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchShopData();
    }, [shopId, form, toast]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        form.setValue('logo', '');
    };

    const onSubmit = async (values: z.infer<typeof shopSettingsSchema>) => {
        try {
            setIsSubmitting(true);

            // Create FormData object
            const formData = new FormData();

            // Append the image file if it exists
            if (logoFile) {
                formData.append('image', logoFile);
            } else if (!values.logo) {
                // If no logo and no existing logo, explicitly remove it
                formData.append('removeLogo', 'true');
            }

            // Append all other fields
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('address[street]', values.address.street || '');
            formData.append('address[city]', values.address.city);
            formData.append('address[state]', values.address.state || '');
            formData.append('address[country]', values.address.country);
            formData.append('contactInfo[email]', values.contactInfo.email);
            formData.append('contactInfo[phone]', values.contactInfo.phone || '');
            formData.append('paymentMethods[cash]', String(values.paymentMethods.cash));
            formData.append('paymentMethods[card]', String(values.paymentMethods.card));
            formData.append('paymentMethods[mobileMoney]', String(values.paymentMethods.mobileMoney));

            // Update shop
            const updatedShop = await shopService.updateShop(shopId!, formData);

            toast({
                title: 'Success',
                description: 'Shop updated successfully',
            });

            // Update form with potentially server-modified values
            form.reset(updatedShop.data);
            setLogoPreview(updatedShop.data.logo || '');
            setLogoFile(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update shop',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Shop Settings</h1>
                <p className="text-muted-foreground">
                    Manage your shop information and preferences
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-4 p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your shop name" {...field} />
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
                                                placeholder="Describe your shop"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="md:col-span-2">
                                <FormLabel>Shop Logo</FormLabel>
                                <div className="flex items-center gap-4 mt-2">
                                    {logoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={
                                                    logoPreview.startsWith('blob:')
                                                        ? logoPreview
                                                        : `${API_BASE_URL}/../uploads/shops/${logoPreview}`
                                                }
                                                alt="Shop logo"
                                                className="h-20 w-20 rounded-md object-cover border"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    setLogoPreview('')
                                                    // e.currentTarget.src = `https://placehold.co/400x200/e0e0e0/000000?text=${shop.name.charAt(0)}`;
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                                        >
                                            Upload Logo
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Recommended size: 500x500px
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-4 p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold">Contact Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="contactInfo.email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@shop.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactInfo.phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold">Address</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="address.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="New York" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State/Province</FormLabel>
                                        <FormControl>
                                            <Input placeholder="NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address.country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="United States" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Payment Methods Section */}
                    <div className="space-y-4 p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold">Payment Methods</h2>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="paymentMethods.cash"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                        <div>
                                            <FormLabel>Cash</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Accept cash payments
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethods.card"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                        <div>
                                            <FormLabel>Credit/Debit Cards</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Accept card payments
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethods.mobileMoney"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                        <div>
                                            <FormLabel>Mobile Money</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Accept mobile payments
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};