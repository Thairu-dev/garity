"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ favoritesCount = 0, onToggleFavorites, onResetView }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button onClick={() => { if(onResetView) onResetView(); }} className="flex items-center gap-2 text-left">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-slate-900 tracking-tight leading-none">Garity</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 leading-none mt-0.5">Gari Quality</span>
          </div>
        </button>
      </div>

      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
        <button onClick={() => { if(onResetView) onResetView(); }} className="hover:text-emerald-600 transition">Browse</button>
        <button onClick={() => handleScrollTo("trends-section")} className="hover:text-emerald-600 transition">Trends</button>
        <button onClick={onToggleFavorites} className="hover:text-emerald-600 transition relative flex items-center gap-1">
          Favorites
          {favoritesCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white animate-scale-in">
              {favoritesCount}
            </span>
          )}
        </button>
        <a href="#" className="hover:text-emerald-600 transition">Sell Car</a>
        <a href="#" className="hover:text-emerald-600 transition">Duty Calculator</a>
        <a href="#" className="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition font-bold">Log In</a>
      </div>

      <button
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-md md:hidden animate-slide-up">
          <div className="px-4 py-4 flex flex-col space-y-4">
            <button onClick={() => { if(onResetView) onResetView(); setMobileOpen(false); }} className="text-left font-medium text-slate-600">Browse</button>
            <button onClick={() => { handleScrollTo("trends-section"); setMobileOpen(false); }} className="text-left font-medium text-slate-600">Trends</button>
            <button onClick={() => { onToggleFavorites(); setMobileOpen(false); }} className="text-left font-medium text-slate-600 flex items-center gap-2">
              Favorites
              {favoritesCount > 0 && <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">{favoritesCount}</span>}
            </button>
            <a href="#" className="font-medium text-slate-600">Sell Car</a>
            <a href="#" className="font-medium text-slate-600">Duty Calculator</a>
            <a href="#" className="text-center text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl font-bold">Log In</a>
          </div>
        </div>
      )}
    </nav>
  );
}
