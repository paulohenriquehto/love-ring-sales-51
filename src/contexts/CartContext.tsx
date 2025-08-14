import React, { createContext, useContext, useState, useEffect } from 'react';
import { type EngravingCustomization } from '@/types/engraving';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  material: string;
  size: string;
  width?: string;
  quantity: number;
  variant_id?: string;
  engraving?: EngravingCustomization;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  material: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, width?: string, engraving?: EngravingCustomization) => void;
  removeItem: (id: string, size: string, width?: string) => void;
  updateQuantity: (id: string, size: string, width: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size: string, width?: string, engraving?: EngravingCustomization) => {
    const existingItemIndex = items.findIndex(
      item => item.id === product.id && 
               item.size === size && 
               item.width === width &&
               JSON.stringify(item.engraving) === JSON.stringify(engraving)
    );

    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += 1;
      setItems(newItems);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        material: product.material,
        size: size,
        width: width,
        quantity: 1,
        engraving: engraving
      };
      setItems([...items, newItem]);
    }
  };

  const removeItem = (id: string, size: string, width?: string) => {
    setItems(items =>
      items.filter(item => !(item.id === id && item.size === size && item.width === width))
    );
  };

  const updateQuantity = (id: string, size: string, width: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size, width);
      return;
    }

    setItems(items =>
      items.map(item =>
        item.id === id && item.size === size && item.width === width
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}