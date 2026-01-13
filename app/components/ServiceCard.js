"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

const ServiceCard = ({ service }) => {
  const router = useRouter();
  const addToCart = useCart();
  const cartService = {
    id: service.id,
    name: service.title,        // or service.name
    price: service.price,
    route: `/booking/${service.id}`,
  };
const imageSrc = service.image || '/images/service-placeholder.jpg';
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border p-5 flex flex-col justify-between">
      {/* Service Image */}
      <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-emerald-50 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={service.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Service Info */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {service.title}
        </h2>

        <p className="text-sm text-green-600 font-medium mt-1">
          {service.category}
        </p>

        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {service.description}
        </p>

        {/* Location & Price */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <img src="/favicon.ico" alt="Location" className="h-4 w-4" />
            {service.location}
          </span>
          <span className="font-semibold text-green-600">
            ${service.price}/hr
          </span>
        </div>

        {/* Provider Info */}
        {service.service_providers?.users?.name && (
          <div className="mt-3 text-xs text-gray-500">
            Provider: <span className="font-medium text-gray-700">{service.service_providers.users.name}</span>
            {service.service_providers.is_verified && (
              <span className="ml-2 text-green-600">✓ Verified</span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-5 space-y-3">
        
        {/* Add to Cart + Buy Now (STEP D GOES HERE) */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              addToCart(cartService);
              toggleCart();
            }}
            className="flex-1 border border-emerald-700 text-emerald-700 py-2 rounded-xl font-medium hover:bg-emerald-50 transition"
          >
            Add to Cart
          </button>
      
          <button
            onClick={() => {
              clearCart();
              addToCart(cartService);
              router.push('/booking/checkout');
            }}
            className="flex-1 bg-forest hover:bg-emerald-900 text-white py-2 rounded-xl font-medium transition"
          >
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
};

export default ServiceCard;