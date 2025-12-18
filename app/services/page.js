'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ServiceCard from '../components/ServiceCard';

const ServicesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all');

  // Mock data for services
  const services = [
    {
      id: 1,
      title: 'Plumbing Services',
      description: 'Expert plumbers for repairs, installations, leaks, clogs, and maintenance.',
      price: 45,
      rating: 4.8,
      category: 'home',
      image: '/images/plumbing.jpg'
    },
    {
      id: 2,
      title: 'Electrical Work',
      description: 'Licensed electricians for wiring, repairs, installations, and safety checks.',
      price: 55,
      rating: 4.9,
      category: 'home',
      image: '/images/electrical.jpg'
    },
    {
      id: 3,
      title: 'Home Cleaning',
      description: 'Professional cleaning for homes and offices — deep clean or recurring plans.',
      price: 35,
      rating: 4.7,
      category: 'cleaning',
      image: '/images/cleaning.jpg'
    },
    {
      id: 4,
      title: 'Tutoring',
      description: 'Expert tutors for all subjects and levels — school to university.',
      price: 40,
      rating: 4.9,
      category: 'education',
      image: '/images/tutoring.jpg'
    },
    {
      id: 5,
      title: 'Gardening Services',
      description: 'Landscaping, lawn care, pruning, and seasonal garden maintenance.',
      price: 30,
      rating: 4.6,
      category: 'outdoor',
      image: '/images/gardening.jpg'
    },
    {
      id: 6,
      title: 'Appliance Repair',
      description: 'Fast repair for common appliances: washing machine, fridge, microwave, and more.',
      price: 50,
      rating: 4.5,
      category: 'home',
      image: '/images/appliance.jpg'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '✨' },
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'outdoor', name: 'Outdoor', icon: '🌿' }
  ];

  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-900 transition">
                  Home
                </Link>{' '}
                <span aria-hidden className="mx-2">
                  ›
                </span>
                <span className="text-slate-900 font-medium">Services</span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Browse services
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Search verified local providers, compare ratings, and book the right service for your needs.
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
              {/* Search */}
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
                  {['Plumber', 'Electrician', 'Cleaning', 'Tutor'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchTerm(tag)}
                      className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pages Dropdown */}
              <div className="lg:col-span-3">
                <label htmlFor="categoryPage" className="block text-sm font-semibold text-slate-800 mb-2">
                  Category pages
                </label>
                <div className="relative">
                  <select
                    id="categoryPage"
                    defaultValue=""
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next) {
                        router.push(next);
                        e.target.value = '';
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Explore category pages</option>
                    <option value="/services/electrical">⚡ Electrical Services</option>
                    <option value="" disabled>
                      🚰 Plumbing (coming soon)
                    </option>
                    <option value="" disabled>
                      🧼 Cleaning (coming soon)
                    </option>
                    <option value="" disabled>
                      🎓 Tutoring (coming soon)
                    </option>
                    <option value="" disabled>
                      🌿 Gardening (coming soon)
                    </option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Quick links to dedicated pages (you can add more later).
                </p>
              </div>

              {/* Helper / CTA */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 h-full">
                  <div className="text-sm font-semibold text-slate-900">Need help choosing?</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Filter by category, then book in minutes. Track status in your dashboard.
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
              {categories.map((category) => {
                const selected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border ${
                      selected
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'bg-white border-emerald-100 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span aria-hidden>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredServices.length}</span> result(s)
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Tip: Use the Electrical category page for specialized filters.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="btn-secondary inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-4 py-2.5 text-sm"
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
            <h3 className="text-xl font-semibold text-slate-900">No services found</h3>
            <p className="text-slate-600 mt-2">Try adjusting your search or selecting a different category.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn-primary mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5"
            >
              Reset
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold">Ready to book?</h2>
              <p className="mt-2 text-white/90 max-w-2xl">
                Pick a service, choose a time slot, and track confirmation from your dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-xl bg-white text-emerald-800 font-bold px-5 py-3 hover:bg-emerald-50 transition"
              >
                Start booking
              </Link>
              <Link
                href="/services/electrical"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white font-bold px-5 py-3 hover:bg-white/10 transition"
              >
                Explore Electrical →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;