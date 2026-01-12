// app/provider/bookings/page.js - Provider Bookings
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.user_type !== "serviceProvider") {
      router.push("/dashboard");
      return;
    }
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getProviderBookings();
      setBookings(response || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      loadBookings(); // Refresh
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "pending") return booking.status === "pending";
    if (activeTab === "active") return ["accepted", "in_progress"].includes(booking.status);
    if (activeTab === "completed") return booking.status === "completed";
    return true;
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600">Manage booking requests from customers</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b">
            <nav className="flex">
              {["pending", "active", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === tab
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {filteredBookings.length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500">No {activeTab} bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.service_type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-sm text-gray-500">
                            📅 {new Date(booking.preferred_date).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            🕐 {booking.preferred_time}
                          </span>
                          <span className="text-sm text-gray-500">
                            📍 {booking.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status.replace("_", " ").toUpperCase()}
                        </span>
                        {booking.quote_amount && (
                          <p className="text-lg font-bold text-gray-900 mt-2">${booking.quote_amount}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            Customer: <span className="font-medium">{booking.customer?.name || "Unknown"}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {booking.address}
                          </p>
                          {booking.customer_notes && (
                            <p className="text-sm text-gray-500 mt-1">📝 Note: {booking.customer_notes}</p>
                          )}
                        </div>
                        <div className="space-x-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "accepted")}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {booking.status === "accepted" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "in_progress")}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                            >
                              Start Job
                            </button>
                          )}
                          {booking.status === "in_progress" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "completed")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}