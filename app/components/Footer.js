// components/Footer.js
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-sage">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔗</span>
              <span className="text-lg font-bold text-slate">SmartMatch</span>
            </Link>
            <p className="text-sm text-gray-500 text-center md:text-left">
              Connecting people with trusted service providers
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link 
              href="/" 
              className="text-sm text-slate hover:text-forest transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className="text-sm text-slate hover:text-forest transition-colors"
            >
              Services
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-slate hover:text-forest transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-slate hover:text-forest transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400">
            © {currentYear} SmartMatch. All rights reserved.
          </div>
        </div>

        {/* Bottom notice - minimal as requested */}
        <div className="mt-8 pt-6 border-t border-cream text-center">
          <p className="text-xs text-gray-400">
            Made for hackathon • Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}