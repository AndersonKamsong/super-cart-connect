import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { shopService } from '@/services/shopService';
// import { User } from '@/types/user';
import { StaffMember } from '@/types/shop';
import { User } from '@/types';

const staffFormSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    role: z.enum(['manager', 'cashier', 'inventory_manager', 'delivery_personnel', 'other']),
    permissions: z.array(z.string()).optional(),
    customTitle: z.string().optional(),
});

export const ShopStaffManagement = () => {
    const { id } = useParams();
    const shopId = id
    const { toast } = useToast();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingStaff, setIsAddingStaff] = useState(false);

    const form = useForm<z.infer<typeof staffFormSchema>>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            userId: '',
            role: 'cashier',
            permissions: [],
            customTitle: '',
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [staffData, usersData] = await Promise.all([
                    shopService.getStaff(shopId),
                    // You'll need a userService to fetch available users
                    // userService.getAvailableUsers()
                ]);
                setStaff(staffData);
                setAvailableUsers(usersData || []);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch staff data',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [shopId, toast]);

    const handleAddStaff = async (values: z.infer<typeof staffFormSchema>) => {
        try {
            setIsAddingStaff(true);
            const newStaff = await shopService.addStaff(shopId, values);
            setStaff([...staff, newStaff]);
            form.reset();
            toast({
                title: 'Success',
                description: 'Staff member added successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add staff member',
                variant: 'destructive',
            });
        } finally {
            setIsAddingStaff(false);
        }
    };

    const handleRemoveStaff = async (staffId: string) => {
        try {
            await shopService.removeStaff(shopId, staffId);
            setStaff(staff.filter(member => member._id !== staffId));
            toast({
                title: 'Success',
                description: 'Staff member removed successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to remove staff member',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return <div>Loading staff data...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Staff Management</h2>
                <p className="text-sm text-muted-foreground">
                    Manage staff members and their permissions
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddStaff)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a user" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableUsers.map(user => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                            <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                            <SelectItem value="delivery_personnel">Delivery Personnel</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional custom title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-end">
                            <Button type="submit" disabled={isAddingStaff}>
                                {isAddingStaff ? 'Adding...' : 'Add Staff'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.length > 0 ? (
                            staff.map(member => (
                                <TableRow key={member._id}>
                                    <TableCell>{member.user.name}</TableCell>
                                    <TableCell>{member.user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize">{member.role}</span>
                                            {member.customTitle && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({member.customTitle})
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${member.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveStaff(member._id)}
                                        >
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No staff members found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};