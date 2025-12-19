// app/dashboard/[role]/ProviderDashboard.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getProviderBookings, updateBookingStatus } from "../../lib/api";

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("requests");
  const [isAvailable, setIsAvailable] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock provider data - will come from NextAuth session & API
  const provider = {
    name: session?.user?.name || "Provider",
    email: session?.user?.email || "provider@example.com",
    service: "Plumbing", // This should be dynamic based on services
    icon: "🔧",
    joinedDate: "December 2024",
    rating: 4.9,
    totalReviews: 47,
    smartScore: 92,
  };

  const fetchBookings = () => {
    setIsLoading(true);
    getProviderBookings(session.user.id)
      .then((res) => {
        setBookings(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => {
    if (session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBookings();
    } else if (session === null) {
      setIsLoading(false);
    }
  }, [session ,fetchBookings]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingStatus(session.user.id, id, status);
      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const handleAccept = (id) => handleUpdateStatus(id, "accepted");
  const handleStart = (id) => handleUpdateStatus(id, "in_progress");
  const handleDecline = (id) => handleUpdateStatus(id, "cancelled");
  const handleComplete = (id) => handleUpdateStatus(id, "completed");

  const stats = [
    {
      label: "Total Jobs",
      value: bookings.length.toString(),
      icon: "📋",
      trend: "Total",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length.toString(),
      icon: "✅",
      trend: "All time",
    },
    {
      label: "Earnings",
      value: "$4,250",
      icon: "💰",
      trend: "+$850 this week",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length.toString(),
      icon: "⏳",
      trend: "Respond soon",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: "bg-blue-100 text-blue-600",
      pending: "bg-yellow-100 text-yellow-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return styles[status] || styles.pending;
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: "bg-gray-100 text-gray-600",
      normal: "bg-blue-100 text-blue-600",
      urgent: "bg-red-100 text-red-600",
    };
    return styles[urgency] || styles.normal;
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-cream">
      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate">
              Provider Dashboard 🛠️
            </h1>
            <p className="text-sage mt-1">
              Manage your services and booking requests
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-cream">
              <span className="text-sm font-medium text-slate">
                Availability:
              </span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  isAvailable ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    isAvailable ? "left-8" : "left-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  isAvailable ? "text-green-500" : "text-gray-400"
                }`}
              >
                {isAvailable ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-cream"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate">{stat.value}</p>
              <p className="text-sm text-sage">{stat.label}</p>
              <p className="text-xs text-forest mt-1">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bookings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-cream overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-cream">
                {["requests", "upcoming", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "text-forest border-b-2 border-forest bg-cream/50"
                        : "text-sage hover:text-slate"
                    }`}
                  >
                    {tab === "requests" && "New Requests"}
                    {tab === "upcoming" && "Upcoming"}
                    {tab === "completed" && "Completed"}
                    {tab === "requests" && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {bookings.filter((b) => b.status === "pending").length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-12 text-sage">
                    Loading bookings...
                  </div>
                ) : (
                  bookings
                    .filter((booking) => {
                      if (activeTab === "requests")
                        return booking.status === "pending";
                      if (activeTab === "upcoming")
                        return ["accepted", "in_progress"].includes(
                          booking.status
                        );
                      return (
                        booking.status === "completed" ||
                        booking.status === "cancelled"
                      );
                    })
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-xl hover:bg-cream/50 transition-all mb-3 border border-cream"
                      >
                        {/* Top Row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center text-white text-lg font-semibold">
                              {booking.users?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate">
                                {booking.users?.name || "Unknown User"}
                              </h4>
                              <p className="text-sm text-sage">
                                {booking.services?.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs text-sage">
                                  📅 {booking.booking_date}
                                </span>
                                <span className="text-xs text-sage">
                                  🕐 {booking.time_slot}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-16 md:ml-0">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(
                                booking.urgency || "normal"
                              )}`}
                            >
                              {(booking.urgency || "normal")
                                .charAt(0)
                                .toUpperCase() +
                                (booking.urgency || "normal").slice(1)}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                booking.status
                              )}`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="ml-16 mb-3">
                          <p className="text-sm text-sage">
                            📍 {booking.address}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-16 flex flex-wrap gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(booking.id)}
                                className="px-4 py-2 bg-forest text-white text-sm font-medium rounded-lg hover:bg-slate transition-all"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleDecline(booking.id)}
                                className="px-4 py-2 bg-white text-red-500 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-all"
                              >
                                ✕ Decline
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleComplete(booking.id)}
                                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-all"
                              >
                                ✓ Mark Complete
                              </button>
                              <button className="px-4 py-2 bg-white text-slate text-sm font-medium rounded-lg border border-cream hover:bg-cream transition-all">
                                📞 Contact
                              </button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <span className="text-sm text-green-500 font-medium">
                              ✓ Job completed successfully
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}

                {!isLoading &&
                  bookings.filter((booking) => {
                    if (activeTab === "requests")
                      return booking.status === "pending";
                    if (activeTab === "upcoming")
                      return ["accepted", "in_progress"].includes(
                        booking.status
                      );
                    return (
                      booking.status === "completed" ||
                      booking.status === "cancelled"
                    );
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-4xl block mb-3">📭</span>
                      <p className="text-sage">No bookings found</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-cream">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center text-3xl">
                  {provider.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-slate">{provider.name}</h4>
                  <p className="text-sm text-sage">
                    {provider.service} Services
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium text-slate">
                      {provider.rating}
                    </span>
                    <span className="text-xs text-sage">
                      ({provider.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* SmartMatch Score */}
              <div className="bg-cream rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate">
                    SmartMatch Score
                  </span>
                  <span className="text-lg font-bold text-forest">
                    {provider.smartScore}/100
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all duration-500"
                    style={{ width: `${provider.smartScore}%` }}
                  />
                </div>
                <p className="text-xs text-sage mt-2">
                  Based on availability, ratings, and response time
                </p>
              </div>

              <div className="pt-4 border-t border-cream">
                <p className="text-xs text-sage">
                  Provider since {provider.joinedDate}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-cream">
              <h3 className="font-semibold text-slate mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate w-full">
                  <span className="text-xl">📝</span>
                  <span className="text-sm font-medium">Edit Services</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate w-full">
                  <span className="text-xl">📍</span>
                  <span className="text-sm font-medium">Update Location</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate w-full">
                  <span className="text-xl">🕐</span>
                  <span className="text-sm font-medium">Set Schedule</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate w-full">
                  <span className="text-xl">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-red-500 w-full">
                  <span className="text-xl">🚪</span>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-linear-to-br from-forest to-slate rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h3 className="font-semibold">Score Breakdown</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream">Availability</span>
                  <span className="font-medium">+40</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream">Urgency Match</span>
                  <span className="font-medium">+20</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream">Rating Bonus</span>
                  <span className="font-medium">+49</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream">Distance Factor</span>
                  <span className="font-medium">-17</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="font-medium">Total Score</span>
                  <span className="text-xl font-bold">92</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
