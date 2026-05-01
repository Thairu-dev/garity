"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CarCard from "@/components/CarCard/CarCard";
import FilterToggle from "@/components/FilterToggle/FilterToggle";

export default function CarGrid({
  listings = [],
  searchFilters = { make: "", model: "", maxPrice: "" },
  favorites = new Set(),
  onToggleFavorite,
  showFavoritesOnly = false,
  isLoading = false,
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  const counts = useMemo(() => ({
    all: listings.length,
    foreign: listings.filter((l) => l.type === "foreign").length,
    local: listings.filter((l) => l.type === "local").length,
  }), [listings]);

  const filtered = useMemo(() => {
    let result = listings;

    if (showFavoritesOnly) {
      result = result.filter((l) => favorites.has(l.id));
    }

    if (activeFilter !== "all") {
      result = result.filter((l) => l.type === activeFilter);
    }

    if (searchFilters.make) {
      result = result.filter(l => l.make.toLowerCase() === searchFilters.make.toLowerCase());
    }

    if (searchFilters.model) {
      result = result.filter(l => l.model.toLowerCase() === searchFilters.model.toLowerCase());
    }

    if (searchFilters.maxPrice) {
      const max = parseInt(searchFilters.maxPrice, 10);
      result = result.filter(l => l.price <= max);
    }

    return result;
  }, [listings, activeFilter, searchFilters, favorites, showFavoritesOnly]);

  return (
    <section id="listings" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {showFavoritesOnly ? (
              <Heart className="h-5 w-5 text-red-500 fill-current" />
            ) : (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {showFavoritesOnly ? "Your Favorites" : "Featured Listings"}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"}{" "}
            {showFavoritesOnly ? "saved" : "available"}
          </p>
        </div>
        <FilterToggle
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="flex gap-3">
                  <div className="h-3 bg-slate-100 rounded w-12" />
                  <div className="h-3 bg-slate-100 rounded w-16" />
                  <div className="h-3 bg-slate-100 rounded w-14" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="h-6 bg-emerald-100 rounded w-28" />
                  <div className="h-6 bg-slate-100 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((listing, i) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <CarCard
                  listing={listing}
                  index={0}
                  isFavorited={favorites.has(listing.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            {showFavoritesOnly ? (
              <Heart className="h-8 w-8 text-slate-400" />
            ) : (
              <TrendingUp className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {showFavoritesOnly ? "No favorites yet" : "No vehicles found"}
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            {showFavoritesOnly
              ? "Click the heart icon on any car card to save it to your favorites."
              : "Try adjusting your filters or search criteria to find what you're looking for."}
          </p>
        </div>
      )}
    </section>
  );
}
