// app/layout.js - UPDATED VERSION
import "./globals.css";
import Script from "next/script";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthInitializer } from "./components/auth/AuthInitializer";

export const metadata = {
  title: "SmartMatch - Connect with Local Service Providers",
  description:
    "Find and book verified local service providers based on location and availability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-cream text-slate">
        <AuthProvider>
          <CartProvider>
            <AuthInitializer />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Script src="https://www.noupe.com/embed/019b3379d0fb717cb2ab08c3dc55a4315c07.js" />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
