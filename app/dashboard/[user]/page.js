'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Optional: if/when your backend is ready, you can replace mock data with API calls.
// import { bookingsAPI } from '../../../../lib/api';

export default function UserDashboardByIdPage() {
  const params = useParams();
  const userId = params?.id;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'requests'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock “asked services” (requests) and bookings for MVP/demo.
  // Later: fetch these from your API (/bookings/user) and /requests endpoints.
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // Example future integration:
        // const { data } = await bookingsAPI.getUserBookings();
        // setBookings(data.bookings);

        // MVP mock data (pretend it belongs to this userId)
        const mockRequests = [
          {
            id: 'REQ-1024',
            title: 'Electrical Troubleshooting',
            category: 'electrical',
            createdAt: '2025-12-10T10:12:00Z',
            preferredDate: '2025-12-20',
            preferredTime: '10:00 AM',
            location: 'Andheri West, Mumbai',
            budget: 900,
            status: 'open', // open | quoted | closed
            details: 'Frequent MCB tripping in living room. Need inspection.'
          },
          {
            id: 'REQ-1025',
            title: 'Home Cleaning (2BHK)',
            category: 'cleaning',
            createdAt: '2025-12-12T16:40:00Z',
            preferredDate: '2025-12-21',
            preferredTime: '2:00 PM',
            location: 'Powai, Mumbai',
            budget: 1200,
            status: 'quoted',
            details: 'Deep cleaning + kitchen focus. Prefer morning slot if possible.'
          }
        ];

        const mockBookings = [
          {
            id: 'BK-2001',
            serviceId: 201,
            service: 'Lighting Installation (Indoor/Outdoor)',
            provider: 'A1 Electric Works',
            date: '2025-12-19',
            time: '12:00 PM',
            status: 'confirmed', // pending | confirmed | completed | cancelled
            price: 1100,
            address: 'Bandra East, Mumbai',
            notes: 'Install 2 ceiling lights + 1 fan regulator check.'
          },
          {
            id: 'BK-2002',
            serviceId: 1,
            service: 'Plumbing Services',
            provider: 'QuickFix Plumbing',
            date: '2025-12-14',
            time: '10:00 AM',
            status: 'completed',
            price: 900,
            address: 'Dadar, Mumbai',
            notes: 'Kitchen sink leakage fixed.'
          },
          {
            id: 'BK-2003',
            serviceId: 3,
            service: 'Home Cleaning',
            provider: 'Clean Co.',
            date: '2025-12-22',
            time: '2:00 PM',
            status: 'pending',
            price: 700,
            address: 'Goregaon, Mumbai',
            notes: ''
          }
        ];

        if (!mounted) return;
        setRequests(mockRequests);
        setBookings(mockBookings);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const statusPill = (status) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border';
    switch (status) {
      case 'confirmed':
        return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
      case 'pending':
        return `${base} bg-amber-50 text-amber-800 border-amber-200`;
      case 'completed':
        return `${base} bg-sky-50 text-sky-800 border-sky-200`;
      case 'cancelled':
        return `${base} bg-rose-50 text-rose-800 border-rose-200`;
      case 'open':
        return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
      case 'quoted':
        return `${base} bg-indigo-50 text-indigo-800 border-indigo-200`;
      case 'closed':
        return `${base} bg-slate-50 text-slate-700 border-slate-200`;
      default:
        return `${base} bg-slate-50 text-slate-700 border-slate-200`;
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        !normalizedSearch ||
        b.service.toLowerCase().includes(normalizedSearch) ||
        b.provider.toLowerCase().includes(normalizedSearch) ||
        b.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, normalizedSearch, statusFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        !normalizedSearch ||
        r.title.toLowerCase().includes(normalizedSearch) ||
        r.location.toLowerCase().includes(normalizedSearch) ||
        r.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, normalizedSearch, statusFilter]);

  const upcomingCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
  }, [bookings]);

  const completedCount = useMemo(() => bookings.filter((b) => b.status === 'completed').length, [bookings]);
  const openRequestsCount = useMemo(() => requests.filter((r) => r.status === 'open').length, [requests]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-900 transition">Home</Link>
                <span aria-hidden className="mx-2">›</span>
                <span className="text-slate-900 font-medium">Dashboard</span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                My Dashboard
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Track your requested services, manage bookings, and see updates from providers.
              </p>
              <div className="mt-3 text-xs text-slate-500">
                User ID: <span className="font-mono text-slate-700">{String(userId ?? '')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5"
              >
                Browse services
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-5 py-2.5"
              >
                New booking
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-emerald-100 p-5">
              <div className="text-sm text-slate-600">Upcoming bookings</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{upcomingCount}</div>
              <div className="mt-2 text-xs text-slate-500">Pending + confirmed</div>
            </div>
            <div className="rounded-2xl bg-white border border-emerald-100 p-5">
              <div className="text-sm text-slate-600">Completed</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{completedCount}</div>
              <div className="mt-2 text-xs text-slate-500">All-time finished jobs</div>
            </div>
            <div className="rounded-2xl bg-white border border-emerald-100 p-5">
              <div className="text-sm text-slate-600">Open requests</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{openRequestsCount}</div>
              <div className="mt-2 text-xs text-slate-500">Waiting for provider response</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Controls */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="sr-only" htmlFor="dash-search">Search</label>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
                <span aria-hidden className="text-slate-400">🔎</span>
                <input
                  id="dash-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by service, provider, request ID..."
                  className="w-full outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="w-full lg:w-64">
              <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="status">Status</label>
              <div className="relative">
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All statuses</option>
                  {/* bookings */}
                  <option value="pending">Pending (booking)</option>
                  <option value="confirmed">Confirmed (booking)</option>
                  <option value="completed">Completed (booking)</option>
                  <option value="cancelled">Cancelled (booking)</option>
                  {/* requests */}
                  <option value="open">Open (request)</option>
                  <option value="quoted">Quoted (request)</option>
                  <option value="closed">Closed (request)</option>
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
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-4 py-3 text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeTab === 'bookings'
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white border-emerald-100 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              Booked services ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeTab === 'requests'
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white border-emerald-100 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              Asked services ({requests.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center text-slate-600">
              Loading your dashboard…
            </div>
          ) : activeTab === 'bookings' ? (
            filteredBookings.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-emerald-100 bg-white p-5 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500 font-mono">{b.id}</div>
                        <div className="mt-1 text-lg font-extrabold text-slate-900">{b.service}</div>
                        <div className="mt-1 text-sm text-slate-600">Provider: <span className="font-semibold">{b.provider}</span></div>
                      </div>
                      <span className={statusPill(b.status)}>{b.status}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                        <div className="text-xs text-slate-600">Date & time</div>
                        <div className="font-semibold text-slate-900 mt-0.5">{b.date} • {b.time}</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                        <div className="text-xs text-slate-600">Estimated total</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">₹{b.price}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      <div className="text-xs text-slate-500">Address</div>
                      <div className="mt-0.5">{b.address}</div>
                    </div>

                    {b.notes ? (
                      <div className="mt-3 text-sm text-slate-600">
                        <div className="text-xs text-slate-500">Notes</div>
                        <div className="mt-0.5">{b.notes}</div>
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <Link
                        href={`/booking?service=${encodeURIComponent(b.serviceId)}`}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-4 py-2.5 text-sm"
                      >
                        Rebook
                      </Link>
                      <Link
                        href="/services"
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-4 py-2.5 text-sm"
                      >
                        Find similar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center">
                <h3 className="text-xl font-extrabold text-slate-900">No bookings found</h3>
                <p className="mt-2 text-slate-600">Try changing your search or status filter.</p>
                <Link
                  href="/services"
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5"
                >
                  Browse services
                </Link>
              </div>
            )
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredRequests.map((r) => (
                <div key={r.id} className="rounded-2xl border border-emerald-100 bg-white p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 font-mono">{r.id}</div>
                      <div className="mt-1 text-lg font-extrabold text-slate-900">{r.title}</div>
                      <div className="mt-1 text-sm text-slate-600">Location: <span className="font-semibold">{r.location}</span></div>
                    </div>
                    <span className={statusPill(r.status)}>{r.status}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                      <div className="text-xs text-slate-600">Preferred slot</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{r.preferredDate} • {r.preferredTime}</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                      <div className="text-xs text-slate-600">Budget</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">₹{r.budget}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    <div className="text-xs text-slate-500">Details</div>
                    <div className="mt-0.5">{r.details}</div>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Link
                      href="/services"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-4 py-2.5 text-sm"
                    >
                      Find providers
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-4 py-2.5 text-sm"
                      onClick={() => {
                        // MVP-only: close request locally
                        setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'closed' } : x)));
                      }}
                    >
                      Mark as closed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center">
              <h3 className="text-xl font-extrabold text-slate-900">No requests found</h3>
              <p className="mt-2 text-slate-600">Try changing your search or status filter.</p>
              <Link
                href="/services"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5"
              >
                Browse services
              </Link>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold">Need something else done?</h2>
              <p className="mt-2 text-white/90 max-w-2xl">
                Browse categories, book a slot, and track confirmation here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl bg-white text-emerald-800 font-bold px-5 py-3 hover:bg-emerald-50 transition"
              >
                Explore services
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white font-bold px-5 py-3 hover:bg-white/10 transition"
              >
                Create booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}