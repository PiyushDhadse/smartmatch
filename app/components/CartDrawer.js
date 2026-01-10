'use client';

import { X, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';


const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    toggleCart,
    increaseQty,
    decreaseQty,
    removeItem,
    totalAmount,
  } = useCart();

  const router = useRouter();

  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-xl transform transition-transform duration-300
      ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <h2 className="text-lg font-semibold">Your Cart</h2>
        <button onClick={toggleCart}>
          <X />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 && (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        )}

        {cartItems.map(item => (
          <div
            CartItem key={item.id} item={item}
            className="flex justify-between items-center border rounded-lg p-3"
          >
            <div
              className="cursor-pointer"
              onClick={() => {
                toggleCart();
                router.push(item.route);
              }}
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => decreaseQty(item.id)}
                className="p-1 border rounded"
              >
                <Minus size={14} />
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() => increaseQty(item.id)}
                className="p-1 border rounded"
              >
                <Plus size={14} />
              </button>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <button
            onClick={() => router.push('/booking/checkout')}
            className="w-full bg-emerald-700 text-white py-2 rounded-md hover:bg-emerald-800"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
