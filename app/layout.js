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
          <script src='https://www.noupe.com/embed/019b3379d0fb717cb2ab08c3dc55a4315c07.js'></script>
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
