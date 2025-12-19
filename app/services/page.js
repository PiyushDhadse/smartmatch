"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ServiceCard from "../components/ServiceCard";

// 1. Define Dummy Data
const DUMMY_SERVICES = [
  {
    id: "1",
    title: "Professional Home Cleaning",
    description:
      "Deep cleaning for houses and apartments using eco-friendly products.",
    category: "cleaning",
    price: 80,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "2",
    title: "Certified Electrician",
    description:
      "Expert wiring, lighting installation, and electrical repairs.",
    category: "home",
    price: 65,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "3",
    title: "Math & Physics Tutor",
    description:
      "Personalized learning for high school and university students.",
    category: "education",
    price: 45,
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "4",
    title: "Landscape Design & Gardening",
    description:
      "Transform your backyard with professional landscaping and maintenance.",
    category: "outdoor",
    price: 120,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1558905619-1725426377c2?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "5",
    title: "Kitchen Plumbing Repair",
    description: "Fixing leaks, clogs, and installing new faucets or sinks.",
    category: "home",
    price: 75,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "6",
    title: "English Language Coaching",
    description:
      "Improve your speaking and writing skills for business or travel.",
    category: "education",
    price: 40,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400",
  },
];

const ServicesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "all"
  );

  const categories = [
    { id: "all", name: "All", icon: "✨" },
    { id: "home", name: "Home", icon: "🏠" },
    { id: "cleaning", name: "Cleaning", icon: "🧼" },
    { id: "education", name: "Education", icon: "🎓" },
    { id: "outdoor", name: "Outdoor", icon: "🌿" },
  ];

  // 2. Filter Dummy Data locally
  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return DUMMY_SERVICES.filter((service) => {
      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "all" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-900 transition">
                  Home
                </Link>
                <span aria-hidden className="mx-2">
                  ›
                </span>
                <span className="text-slate-900 font-medium">Services</span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Browse services
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Search verified local providers, compare ratings, and book the
                right service for your needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="btn-secondary inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-5 py-2.5"
              >
                Become a Provider
              </Link>
              <Link
                href="/booking"
                className="btn-primary inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5"
              >
                Book now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Search + Filters */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <label className="sr-only" htmlFor="search">
                  Search services
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
                  <span aria-hidden className="text-slate-400">
                    🔎
                  </span>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search: electrician, tutor, cleaning..."
                    className="w-full outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Popular:</span>
                  {["Plumber", "Electrician", "Cleaning", "Tutor"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="lg:col-span-3">
                <label
                  htmlFor="categoryPage"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  Category pages
                </label>
                <select
                  id="categoryPage"
                  defaultValue=""
                  onChange={(e) =>
                    e.target.value && router.push(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Explore category pages</option>
                  <option value="/services/electrical">
                    ⚡ Electrical Services
                  </option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 h-full">
                  <div className="text-sm font-semibold text-slate-900">
                    Need help choosing?
                  </div>
                  <Link
                    href="/dashboard/user"
                    className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    View dashboard →
                  </Link>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border ${
                    selectedCategory === category.id
                      ? "bg-emerald-700 border-emerald-700 text-white"
                      : "bg-white border-emerald-100 text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results section */}
        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredServices.length}
            </span>{" "}
            result(s)
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Clear filters
          </button>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-14 bg-white border border-emerald-100 rounded-2xl">
            <h3 className="text-xl font-semibold text-slate-900">
              No services found
            </h3>
            <p className="text-slate-600 mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Export
export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
