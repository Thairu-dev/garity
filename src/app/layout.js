/**
 * Learning Note:
 * layout.js is the root layout — it wraps EVERY page in the app.
 * Next.js App Router requires exactly one root layout that renders <html> and <body>.
 * We use `next/font/google` to load Inter, which eliminates layout shift (FOIT/FOUT)
 * by self-hosting the font. Metadata export enables SEO — title and description
 * appear in search results. The Navbar was moved to page.js so it can access
 * favorites state that lives in the page component.
 */

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Garity — Gari Quality | Kenya's Smart Car Search",
  description:
    "Find your perfect car deal in Kenya. Garity aggregates listings from top dealerships, compares prices, and tracks market trends so you get the best gari quality.",
  keywords: ["cars Kenya", "used cars Nairobi", "car search", "Garity", "Gari Quality"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
