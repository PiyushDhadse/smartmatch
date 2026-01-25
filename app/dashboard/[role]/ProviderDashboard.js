// app/dashboard/[role]/ProviderDashboard.js - REDESIGNED
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import Link from "next/link";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    pending: 0,
    completed: 0,
    earnings: 0,
  });

  const router = useRouter();
  const { user: authUser, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }

    if (authUser) {
      loadDashboardData();
    }
  }, [authUser, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user profile
      const profileRes = await api.getProfile();
      setUser(profileRes);

      // Get bookings
      const bookingsRes = await api.getProviderBookings();
      setBookings(bookingsRes || []);

      // Get services
      const servicesRes = await api.getMyServices();
      setServices(servicesRes || []);

      // Calculate stats
      const completedBookings = (bookingsRes || []).filter(
        (b) => b.status === "completed",
      );
      const earnings = completedBookings.reduce(
        (sum, b) => sum + (b.quote_amount || 0),
        0,
      );

      setStats({
        totalJobs: bookingsRes?.length || 0,
        pending: (bookingsRes || []).filter((b) => b.status === "pending")
          .length,
        completed: completedBookings.length,
        earnings: earnings,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "pending") return booking.status === "pending";
    if (activeTab === "active")
      return ["accepted", "in_progress"].includes(booking.status);
    if (activeTab === "completed")
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

  const urgencyColors = {
    low: "bg-gray-100 text-gray-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    emergency: "bg-red-100 text-red-800",
  };

  if (loading || authLoading) {
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
                Welcome back, {user?.name || "Provider"} 👋
              </h1>
              <p className="text-gray-600">Manage your services and bookings</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/services/create")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                + Add Service
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="text-2xl font-bold">
                  ${stats.earnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex">
                  {[
                    {
                      key: "pending",
                      label: "Pending Requests",
                      count: stats.pending,
                    },
                    {
                      key: "active",
                      label: "Active Jobs",
                      count: bookings.filter((b) =>
                        ["accepted", "in_progress"].includes(b.status),
                      ).length,
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      count: stats.completed,
                    },
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
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-500">
                      No {activeTab} bookings found
                    </p>
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
                              {booking.service_type || "Service Request"}
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
                                🕐 {booking.preferred_time || "Flexible"}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  urgencyColors[booking.urgency] ||
                                  urgencyColors.normal
                                }`}
                              >
                                {booking.urgency || "Normal"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[booking.status]
                              }`}
                            >
                              {booking.status.replace("_", " ").toUpperCase()}
                            </span>
                            {booking.quote_amount && (
                              <p className="text-lg font-bold text-gray-900 mt-2">
                                ${booking.quote_amount}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                📍 {booking.address}, {booking.city}
                              </p>
                              {booking.customer_notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  📝 {booking.customer_notes}
                                </p>
                              )}
                            </div>
                            {booking.status === "pending" && (
                              <div className="space-x-2">
                                <button
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "accepted",
                                    )
                                  }
                                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "cancelled",
                                    )
                                  }
                                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {booking.status === "accepted" && (
                              <button
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "in_progress",
                                  )
                                }
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Start Job
                              </button>
                            )}
                            {booking.status === "in_progress" && (
                              <button
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "completed",
                                  )
                                }
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                              >
                                Mark Complete
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

          {/* Right Column - Profile & Services */}
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
                    {user?.user_type === "serviceProvider"
                      ? "Service Provider"
                      : "Provider"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Services Offered</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.services && user.services.length > 0 ? (
                      user.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No services added yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link
                    href="/profile/edit"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/services/create")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">➕</span>
                  <span className="text-gray-700">Add New Service</span>
                </button>
                <button
                  onClick={() => router.push("/services/manage")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">📋</span>
                  <span className="text-gray-700">Manage Services</span>
                </button>
                <button
                  onClick={() => router.push("/schedule")}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">📅</span>
                  <span className="text-gray-700">Set Availability</span>
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
