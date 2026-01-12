// app/bookings/page.js - Customer Bookings Page
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import Link from "next/link";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { user } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getUserBookings();
      setBookings(response || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return ["pending", "accepted", "in_progress"].includes(booking.status);
    } else if (activeTab === "completed") {
      return booking.status === "completed";
    } else if (activeTab === "cancelled") {
      return booking.status === "cancelled";
    }
    return true;
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.cancelBooking(bookingId);
      loadBookings(); // Refresh list
      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">
                Track and manage your service requests
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition shadow-md"
            >
              + Book New Service
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    bookings.filter((b) =>
                      ["pending", "accepted", "in_progress"].includes(b.status)
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                {
                  key: "upcoming",
                  label: "Upcoming",
                  count: bookings.filter((b) =>
                    ["pending", "accepted", "in_progress"].includes(b.status)
                  ).length,
                },
                {
                  key: "completed",
                  label: "Completed",
                  count: bookings.filter((b) => b.status === "completed")
                    .length,
                },
                {
                  key: "cancelled",
                  label: "Cancelled",
                  count: bookings.filter((b) => b.status === "cancelled")
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">
                  {activeTab === "upcoming" ? "📋" : "📜"}
                </div>
                <p className="text-gray-500 text-lg mb-4">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming bookings"
                    : `No ${activeTab} bookings found`}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/services"
                    className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition shadow"
                  >
                    Book Your First Service
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left Column - Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {booking.service_type || "Service Request"}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {booking.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              statusColors[booking.status]
                            }`}
                          >
                            {statusLabels[booking.status]}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Date
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {new Date(
                                booking.preferred_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Time
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {booking.preferred_time || "Flexible"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Location
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {booking.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Amount
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {booking.quote_amount
                                ? `$${booking.quote_amount}`
                                : "Not quoted"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-200">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Provider:</span>{" "}
                                {booking.provider?.name || "Not assigned yet"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Address:</span>{" "}
                                {booking.address}
                              </p>
                              {booking.customer_notes && (
                                <p className="text-sm text-gray-500 mt-2">
                                  <span className="font-medium">
                                    Your note:
                                  </span>{" "}
                                  {booking.customer_notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              {booking.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                                >
                                  Cancel Booking
                                </button>
                              )}
                              <Link
                                href={`/booking/${booking.id}`}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center">
            <div className="mr-4">
              <span className="text-3xl">❓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Need help with a booking?
              </h3>
              <p className="text-gray-600 mt-1">
                Contact our support team or check our{" "}
                <Link
                  href="/help"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  help center
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
