"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import CartDrawer from './CartDrawer';
import { useAuth } from "@/app/context/AuthContext"; // Import custom auth hook

export default function Navbar() {
  const { cartItems, toggleCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user, logout, isAuthenticated } = useAuth(); // Add custom auth

  const navLinks = [{ href: "/", label: "Home" }];

  const serviceLinks = [];

  const isActive = (path) => pathname === path;
  const isServicesActive =
    pathname === "/services" || pathname?.startsWith("/services/");

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const btnPrimary =
    "inline-flex items-center justify-center rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition px-5 py-2.5";
  const btnSecondary =
    "inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold hover:bg-emerald-50 transition px-5 py-2.5";

  // Determine which auth system to use
  const isLoggedIn = isAuthenticated || session;
  const currentUser = user || session?.user;

  const handleLogout = async () => {
    if (isAuthenticated) {
      await logout(); // Custom auth logout
    }
    if (session) {
      await signOut({ callbackUrl: "/" }); // NextAuth logout
    }
  };

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">
            <img className="h-20" src="./favicon.ico" alt="" />
          </span>
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
                  ? "text-emerald-800 border-emerald-700"
                  : "text-slate-700 border-transparent hover:text-emerald-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Services Link */}
          <Link
            href="/services"
            className={`text-sm font-medium py-2 border-b-2 transition-all duration-300 ${
              isServicesActive
                ? "text-emerald-800 border-emerald-700"
                : "text-slate-700 border-transparent hover:text-emerald-800"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-base" aria-hidden>
                🧰
              </span>
              Services
            </span>
          </Link>
        </div>
        {/* Cart Icon */}
        <div className="relative cursor-pointer" onClick={toggleCart}>
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
        </div>

        <CartDrawer />

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
            <>
              <Link 
                href={currentUser?.role === 'provider' ? '/dashboard/provider' : '/dashboard/user'} 
                className={`${btnPrimary} text-sm`}
              >
                {currentUser?.name || 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`${btnSecondary} text-sm`}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl text-slate-800 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
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
                  isActive(link.href)
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Services Link */}
            <Link
              href="/services"
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                isServicesActive
                  ? "bg-emerald-50 text-emerald-900"
                  : "text-slate-700 hover:bg-emerald-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>🧰</span>
                Services
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-emerald-50">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className={`${btnSecondary} w-full text-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`${btnPrimary} w-full text-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={currentUser?.role === 'provider' ? '/dashboard/provider' : '/dashboard/user'}
                  className={`${btnPrimary} w-full text-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {currentUser?.name || 'Dashboard'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className={`${btnSecondary} w-full text-center`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}