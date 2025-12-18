"use client";

import React from "react";
import Link from "next/link";

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border p-5 flex flex-col justify-between">
      
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
            ₹{service.price}
          </span>
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/booking?serviceId=${service.id}`}
        className="mt-5 text-center bg-emerald-700 hover:bg-emerald-900 text-white py-2 rounded-xl font-medium transition"
      >
        Book Service
      </Link>
    </div>
  );
};

export default ServiceCard;