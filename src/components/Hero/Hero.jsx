"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function Hero({ onSearch, listings = [] }) {
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    maxPrice: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(filters);
  };

  const makes = Array.from(new Set(listings.map((l) => l.make))).filter(Boolean).sort();

  const filteredListings = filters.make 
    ? listings.filter((l) => l.make === filters.make)
    : listings;

  const models = Array.from(new Set(filteredListings.map((l) => l.model))).filter(Boolean).sort();

  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto mt-16 px-4 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Data from Jiji, PigiaMe & Facebook
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight animate-slide-up">
          Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Quality</span> Cars <br className="hidden md:block" /> Without the Hustle.
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
          Garity aggregates thousands of listings from across Kenya so you can compare prices, check logbooks, and find the best deals in seconds.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          
          <div className="relative w-full md:w-1/4">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Make</label>
            <select 
              value={filters.make}
              onChange={(e) => setFilters(prev => ({...prev, make: e.target.value, model: ""}))}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Any Make</option>
              {makes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-1/4">
             <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model</label>
            <select 
              value={filters.model}
              onChange={(e) => setFilters(prev => ({...prev, model: e.target.value}))}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              disabled={models.length === 0}
            >
              <option value="">Any Model</option>
              {models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-1/4">
             <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</label>
            <select 
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">No Limit</option>
              <option value="1500000">Ksh 1.5M</option>
              <option value="3000000">Ksh 3.0M</option>
              <option value="5000000">Ksh 5.0M</option>
              <option value="8000000">Ksh 8.0M</option>
            </select>
          </div>

          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl w-full md:flex-1 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </button>
        </form>

        {/* Source Brands */}
        <div className="mt-10 flex justify-center gap-6 text-slate-400 text-sm font-medium grayscale opacity-70 animate-slide-up" style={{ animationDelay: "300ms" }}>
           <span className="flex items-center gap-1"><span className="font-bold text-slate-600">Jiji</span></span>
           <span className="flex items-center gap-1"><span className="font-bold text-slate-600">PigiaMe</span></span>
           <span className="flex items-center gap-1"><span className="font-bold text-slate-600">Facebook</span></span>
           <span className="flex items-center gap-1"><span className="font-bold text-slate-600">Autochek</span></span>
        </div>
      </div>
    </section>
  );
}
