// app/layout.js
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SessionProvider from "./context/SessionProvider";

export const metadata = {
  title: "SmartMatch - Connect with Local Service Providers",
  description:
    "Find and book verified local service providers based on location and availability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-cream text-slate">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
