'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const pathname = usePathname();

  const servicesRef = useRef(null);

  // Mock auth state - will be replaced with NextAuth
  const isLoggedIn = false;
  const userType = null; // 'user' or 'provider'

  const navLinks = [{ href: '/', label: 'Home' }];

  const serviceLinks = [
    { href: '/services/electrical', label: 'Electrical', icon: '⚡' },
    { href: '/services?category=home', label: 'Plumbing', icon: '🚰' },
    { href: '/services?category=cleaning', label: 'Cleaning', icon: '🧼' },
    { href: '/services?category=education', label: 'Tutoring', icon: '🎓' },
    { href: '/services?category=outdoor', label: 'Gardening', icon: '🌿' }
  ];

  const isActive = (path) => pathname === path;
  const isServicesActive = pathname === '/services' || pathname?.startsWith('/services/');

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    setIsMobileServicesOpen(false);
  }, [pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setIsServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const btnPrimary =
    'inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5';
  const btnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-5 py-2.5';

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🔗</span>
          <span className="text-xl font-bold text-slate-900">SmartMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium py-2 border-b-2 transition-all duration-300 ${
                isActive(link.href)
                  ? 'text-emerald-800 border-emerald-700'
                  : 'text-slate-700 border-transparent hover:text-emerald-800'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Services Dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              onClick={() => setIsServicesOpen((v) => !v)}
              className={`flex items-center gap-2 text-sm font-medium py-2 border-b-2 transition-all duration-300 ${
                isServicesActive
                  ? 'text-emerald-800 border-emerald-700'
                  : 'text-slate-700 border-transparent hover:text-emerald-800'
              }`}
              aria-haspopup="menu"
              aria-expanded={isServicesOpen}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  🧰
                </span>
                Services
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isServicesOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-3 w-64 rounded-2xl border border-emerald-100 bg-white shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                  <div className="text-sm font-semibold text-slate-900">Browse services</div>
                  <div className="text-xs text-slate-600 mt-0.5">Quick links to categories</div>
                </div>
                <div className="p-2">
                  {serviceLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      <span className="text-lg" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <div className="my-2 border-t border-emerald-100" />
                  <Link
                    href="/services"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <span>View all services</span>
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className={`${btnSecondary} text-sm`}>
                Login
              </Link>
              <Link href="/register" className={`${btnPrimary} text-sm`}>
                Get Started
              </Link>
            </>
          ) : (
            <Link
              href={userType === 'provider' ? '/dashboard/provider' : '/dashboard/user'}
              className={`${btnPrimary} text-sm`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl text-slate-800 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-emerald-50 px-5 py-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href) ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-emerald-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Services accordion */}
            <button
              type="button"
              onClick={() => setIsMobileServicesOpen((v) => !v)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                isServicesActive ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-emerald-50'
              }`}
              aria-expanded={isMobileServicesOpen}
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>🧰</span>
                Services
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isMobileServicesOpen && (
              <div className="ml-2 pl-2 border-l border-emerald-100 flex flex-col gap-1">
                {serviceLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="py-2 px-3 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 transition flex items-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileServicesOpen(false);
                    }}
                  >
                    <span aria-hidden>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <Link
                  href="/services"
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileServicesOpen(false);
                  }}
                >
                  View all services →
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-emerald-50">
            {!isLoggedIn ? (
              <>
                <Link href="/login" className={`${btnSecondary} w-full text-center`}>
                  Login
                </Link>
                <Link href="/register" className={`${btnPrimary} w-full text-center`}>
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href={userType === 'provider' ? '/dashboard/provider' : '/dashboard/user'}
                className={`${btnPrimary} w-full text-center`}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}