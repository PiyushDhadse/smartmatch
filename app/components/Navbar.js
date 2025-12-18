// components/Navbar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mock auth state - will be replaced with NextAuth
  const isLoggedIn = false;
  const userType = null; // 'user' or 'provider'

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white border-b border-sage sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🔗</span>
          <span className="text-xl font-bold text-slate">SmartMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium py-2 border-b-2 transition-all duration-300 ${
                isActive(link.href)
                  ? 'text-forest border-forest'
                  : 'text-slate border-transparent hover:text-forest'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link 
                href="/login" 
                className="btn-secondary px-5 py-2.5 text-sm"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              href={userType === 'provider' ? '/dashboard/provider' : '/dashboard/user'}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl text-slate p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-cream px-5 py-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-cream text-forest'
                    : 'text-slate hover:bg-cream'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-cream">
            <Link
              href="/login"
              className="btn-secondary w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}