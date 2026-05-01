"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import MarketTrends from "@/components/MarketTrends/MarketTrends";
import CarGrid from "@/components/CarGrid/CarGrid";
import { mockListings } from "@/data/mockListings";

export default function Home() {
  const [listings, setListings] = useState(mockListings);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState("mock");
  const [scrapedAt, setScrapedAt] = useState(null);
  const [searchFilters, setSearchFilters] = useState({ make: "", model: "", maxPrice: "" });
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Fetch listings from the API on mount
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();

        if (data.listings && data.listings.length > 0) {
          // Ensure each listing has the fields the frontend expects
          const normalised = data.listings.map((l) => ({
            id: l.id,
            make: l.make || "Unknown",
            model: l.model || "",
            year: l.year || null,
            price: l.price || 0,
            currency: l.currency || "KES",
            type: l.type || "unknown",
            mileage: l.mileage || 0,
            location: l.location || "",
            image: l.image || "/images/car-1.png",
            priceHistory: l.priceHistory || [l.price || 0],
            verified: l.verified || false,
            source: l.source || "Jiji Kenya",
            description: l.description || "",
            sourceUrl: l.sourceUrl || null,
            transmission: l.transmission || null,
            features: l.features || [],
          }));
          setListings(normalised);
          setDataSource(data.meta?.source || "scraped");
          setScrapedAt(data.meta?.scrapedAt || null);
        }
      } catch (err) {
        console.warn("Failed to fetch listings from API, using mock data:", err.message);
        // Keep mock listings as fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleFavoritesView = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
    setTimeout(() => {
      const el = document.getElementById("listings");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleResetView = useCallback(() => {
    setShowFavoritesOnly(false);
    setSearchFilters({ make: "", model: "", maxPrice: "" });
    setTimeout(() => {
      const el = document.getElementById("listings");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setShowFavoritesOnly(false);
    const el = document.getElementById("listings");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar
        favoritesCount={favorites.size}
        onToggleFavorites={handleToggleFavoritesView}
        onResetView={handleResetView}
      />
      <Hero onSearch={handleSearch} listings={listings} />
      <MarketTrends />

      {/* Data source indicator */}
      {!isLoading && dataSource !== "mock" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mb-4 mt-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live data from {dataSource}
            {scrapedAt && (
              <span className="text-slate-300">
                · Updated {new Date(scrapedAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="text-slate-300">· {listings.length} listings</span>
          </div>
        </div>
      )}

      <CarGrid
        listings={listings}
        searchFilters={searchFilters}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showFavoritesOnly={showFavoritesOnly}
        isLoading={isLoading}
      />
    </>
  );
}
