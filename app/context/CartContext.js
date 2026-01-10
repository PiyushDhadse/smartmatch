'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    const savedCart = localStorage.getItem('smartmatch_cart');
    if (savedCart) {
        setCartItems(JSON.parse(savedCart));
    }
    }, []);
  useEffect(() => {
    localStorage.setItem('smartmatch_cart', JSON.stringify(cartItems));
    }, [cartItems]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toggle cart drawer
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Add item to cart
  const addToCart = (service) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === service.id);

      if (existing) {
        return prev.map(item =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...service, quantity: 1 }];
    });
  };

  // Increase quantity
  const increaseQty = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQty = (id) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // Remove item completely
  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear cart (used for Buy Now)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('smartmatch_cart');
  };


  // Total price
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        toggleCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
