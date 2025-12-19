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
      <body>
        <SessionProvider>
        <Navbar/>
        {children}
        <Footer/>
        {/* ThinkStack AI Chatbot */}
        <script src='https://www.noupe.com/embed/019b3379d0fb717cb2ab08c3dc55a4315c07.js'></script>
        <script src="https://cdn.thinkstack.ai/widget.js" async></script>
        </SessionProvider>
      </body>
    </html>
  )
}