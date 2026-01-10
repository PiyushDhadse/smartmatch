'use client';

import { Plus, Minus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const router = useRouter();
  const { increaseQty, decreaseQty, removeItem, toggleCart } = useCart();

  return (
    <div className="flex justify-between items-center border rounded-lg p-3">
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
  );
};

export default CartItem;
