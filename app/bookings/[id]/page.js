// app/booking/[id]/page.js - Booking Details Page
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import Link from "next/link";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [params.id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      // You'll need to create this API endpoint
      const response = await api.getBookingById(params.id);
      setBooking(response);
    } catch (error) {
      console.error("Failed to load booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">Booking not found</p>
          <Link
            href="/bookings"
            className="mt-4 inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h1>
              <p className="text-gray-600">
                ID: {booking.id.substring(0, 8)}...
              </p>
            </div>
            <Link
              href="/bookings"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Bookings
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span
                className={`px-4 py-2 rounded-full font-medium ${
                  statusColors[booking.status]
                }`}
              >
                {booking.status.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-gray-500 text-sm">
                Created: {new Date(booking.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Service Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">
                  {booking.service_type}
                </h3>
                <p className="text-gray-600 mt-2">{booking.description}</p>
              </div>
            </div>

            {/* Grid of Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(booking.preferred_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {booking.preferred_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgency:</span>
                    <span className="font-medium capitalize">
                      {booking.urgency}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right">
                      {booking.address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{booking.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            {booking.provider && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Service Provider
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.provider.name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Rating: ⭐ {booking.provider.rating || "Not rated yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.customer_notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Your Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">{booking.customer_notes}</p>
                </div>
              </div>
            )}

            {/* Pricing */}
            {(booking.quote_amount || booking.final_amount) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  {booking.quote_amount && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600">Quoted Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${booking.quote_amount}
                      </p>
                    </div>
                  )}
                  {booking.final_amount && (
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <p className="text-gray-600">Final Amount</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        ${booking.final_amount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {booking.status === "pending" && (
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to cancel this booking?")
                    ) {
                      // Handle cancel
                      alert("Cancellation feature to be implemented");
                    }
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
