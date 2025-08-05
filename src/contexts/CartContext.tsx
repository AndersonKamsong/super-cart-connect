// contexts/CartContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  shopId: any;
  image: string;
}

interface ShopGroup {
  shop: string;
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string, shopId: string, variantId?: string) => void;
  updateQuantity: (productId: string, shopId: string, variantId: string | undefined, newQuantity: number) => void;
  clearCart: () => void;
  clearShopCart: (shopId: string) => void; // New method to clear items from a specific shop
  totalItems: number;
  totalPrice: number;
  getShopItems: (shopId: string) => CartItem[]; // New method to get items by shop
  shopSubtotals: Record<string, number>; // Object with shopId as key and subtotal as value
  groupItemsByShop: () => ShopGroup[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cartItems: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      setCartItems(savedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem =>
          cartItem.productId === item.productId &&
          cartItem.shopId === item.shopId &&
          cartItem.variantId === item.variantId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...item, quantity: item.quantity }];
      }
    });
  };

  const removeFromCart = (productId: string, shopId: string, variantId?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item =>
          !(item.productId === productId &&
            item.shopId === shopId &&
            item.variantId === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, shopId: string, variantId: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId &&
          item.shopId === shopId &&
          item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearShopCart = (shopId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.shopId !== shopId));
  };

  const getShopItems = (shopId: string) => {
    return cartItems.filter(item => item.shopId === shopId);
  };

  const groupItemsByShop = (): ShopGroup[] => {
    const shopGroups: Record<string, ShopGroup> = {};

    cartItems.forEach(item => {
      let id = item?.shopId?._id
      if (!shopGroups[id]) {
        shopGroups[id] = {
          shop: id,
          items: [],
          subtotal: 0
        };
      }
      shopGroups[id].items.push(item);
      shopGroups[id].subtotal += item.price * item.quantity;
    });

    return Object.values(shopGroups);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate subtotals by shop
  const shopSubtotals = cartItems.reduce((acc, item) => {
    acc[item.shopId] = (acc[item.shopId] || 0) + (item.price * item.quantity);
    return acc;
  }, {} as Record<string, number>);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        groupItemsByShop,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearShopCart,
        getShopItems,
        totalItems,
        totalPrice,
        shopSubtotals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};