import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "./components/toast/ToastProvider";
import { AuthProvider } from "./components/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VakilAi",
  description: "VakilAi",
  icons: {
    icon: '/lawyer.png'
  }
};

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
          {/* Layout UI */}
          {/* Place children where you want to render a page or nested layout */}
          <main><AuthProvider><ToastProvider />{children}</AuthProvider></main>
        </body>
      </html>
    )
  }