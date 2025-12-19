// app/dashboard/[role]/UserDashboard.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getMyBookings } from "../../lib/api";
import { supabase } from "../../lib/supabase";
export default function UserDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - fallback if session not ready
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || null,
    joinedDate: "January 2025",
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
        *,
        services (title, category),
        service_providers (users (name))
      `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        setBookings(data || []);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, [session]);

  const getCategoryIcon = (category) => {
    const icons = {
      Plumbing: "🔧",
      Electrical: "⚡",
      Cleaning: "🧹",
      Tutoring: "📚",
      Carpentry: "🔨",
      Painting: "🎨",
    };
    return icons[category] || "🛠️";
  };

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length.toString(),
      icon: "📅",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length.toString(),
      icon: "✅",
    },
    {
      label: "Upcoming",
      value: bookings
        .filter((b) =>
          ["accepted", "pending", "in_progress"].includes(b.status)
        )
        .length.toString(),
      icon: "⏳",
    },
    {
      label: "Cancelled",
      value: bookings.filter((b) => b.status === "cancelled").length.toString(),
      icon: "❌",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      accepted: "bg-blue-100 text-blue-600",
      in_progress: "bg-purple-100 text-purple-600",
      pending: "bg-yellow-100 text-yellow-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return styles[status] || styles.pending;
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-cream">
      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-sage mt-1">
              Manage your bookings and track service status
            </p>
          </div>
          <Link href="/services" className="btn-primary w-fit">
            + Book New Service
          </Link>
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
                {["bookings", "history"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "text-forest border-b-2 border-forest bg-cream/50"
                        : "text-sage hover:text-slate"
                    }`}
                  >
                    {tab === "bookings" ? "Active Bookings" : "Booking History"}
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
                    .filter((booking) =>
                      activeTab === "bookings"
                        ? ["confirmed", "pending"].includes(booking.status)
                        : ["completed", "cancelled"].includes(booking.status)
                    )
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl hover:bg-cream transition-all mb-3 border border-cream"
                      >
                        <div className="flex items-start gap-4 mb-3 md:mb-0">
                          <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-2xl">
                            {getCategoryIcon(booking.services?.category)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate">
                              {booking.services?.title}
                            </h4>
                            <p className="text-sm text-sage">
                              {booking.service_providers?.users?.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-sage">
                              <span>📅 {booking.booking_date}</span>
                              <span>🕐 {booking.time_slot}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-16 md:ml-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              booking.status
                            )}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                          <button className="p-2 hover:bg-white rounded-lg transition-all text-sage hover:text-slate">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                )}

                {bookings.filter((booking) =>
                  activeTab === "bookings"
                    ? ["confirmed", "pending"].includes(booking.status)
                    : ["completed", "cancelled"].includes(booking.status)
                ).length === 0 && (
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
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-cream">
              <h3 className="font-semibold text-slate mb-4">Your Profile</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-forest rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate">{user.name}</h4>
                  <p className="text-sm text-sage">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-cream">
                <p className="text-xs text-sage">
                  Member since {user.joinedDate}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-cream">
              <h3 className="font-semibold text-slate mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/services"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate"
                >
                  <span className="text-xl">🔍</span>
                  <span className="text-sm font-medium">Browse Services</span>
                </Link>
                <Link
                  href="/booking"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-slate"
                >
                  <span className="text-xl">📅</span>
                  <span className="text-sm font-medium">New Booking</span>
                </Link>
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
          </div>
        </div>
      </div>
    </div>
  );
}
