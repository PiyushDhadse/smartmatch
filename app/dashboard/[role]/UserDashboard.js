// app/dashboard/[role]/UserDashboard.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import Link from "next/link";

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ← ADD THIS LINE
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load profile
      try {
        const profileRes = await api.getProfile();
        console.log("Profile response:", profileRes);

        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
        } else {
          console.warn("Profile response format unexpected:", profileRes);
          setUser(profileRes); // Try raw response
        }
      } catch (profileError) {
        console.error("Profile error:", profileError);
        if (profileError.response?.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
      }

      // 2. Load bookings (SIMPLIFIED)
      try {
        const bookingsRes = await api.getUserBookings();
        console.log("Bookings response:", bookingsRes);

        if (bookingsRes.success) {
          setBookings(bookingsRes.data || []);
        } else if (Array.isArray(bookingsRes)) {
          // If API returns array directly
          setBookings(bookingsRes);
        } else {
          setBookings([]);
        }
      } catch (bookingsError) {
        console.error("Bookings error:", bookingsError);
        setBookings([]); // Set empty array to prevent crashes
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      setError(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming")
      return ["pending", "accepted", "in_progress"].includes(booking.status);
    if (activeTab === "past")
      return ["completed", "cancelled"].includes(booking.status);
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
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hello, {user?.name || "Customer"} 👋
              </h1>
              <p className="text-gray-600">Track your service requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/services")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Book New Service
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex">
                  {[
                    { key: "upcoming", label: "Upcoming Bookings" },
                    { key: "past", label: "Past Bookings" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                        activeTab === tab.key
                          ? "border-emerald-600 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
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
                    <p className="text-gray-500">
                      {activeTab === "upcoming"
                        ? "No upcoming bookings"
                        : "No past bookings"}
                    </p>
                    {activeTab === "upcoming" && (
                      <button
                        onClick={() => router.push("/services")}
                        className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                      >
                        Book Your First Service
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {booking.service_type}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <span className="text-sm text-gray-500">
                                📅{" "}
                                {new Date(
                                  booking.preferred_date,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                🕐 {booking.preferred_time}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  statusColors[booking.status]
                                }`}
                              >
                                {booking.status.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {booking.quote_amount && (
                            <p className="text-lg font-bold text-gray-900">
                              ${booking.quote_amount}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                📍 {booking.address}, {booking.city}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Provider:{" "}
                                {booking.provider?.name || "Not assigned yet"}
                              </p>
                            </div>
                            {booking.status === "pending" && (
                              <button
                                onClick={() =>
                                  router.push(`/booking/${booking.id}/cancel`)
                                }
                                className="text-red-600 text-sm hover:text-red-700"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    Customer
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{bookings.length}</p>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">
                      {bookings.filter((b) => b.status === "completed").length}
                    </p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/services")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">🔍</span>
                  <span className="text-gray-700">Find Services</span>
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-gray-700">Edit Profile</span>
                </button>
                <button
                  onClick={() => router.push("/help")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">❓</span>
                  <span className="text-gray-700">Help Center</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 transition text-red-600"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
