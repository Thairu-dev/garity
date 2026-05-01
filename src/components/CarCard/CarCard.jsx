"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Gauge, Calendar, ShieldCheck, ExternalLink, Heart } from "lucide-react";
import Sparkline from "@/components/Sparkline/Sparkline";
import { formatPrice } from "@/utils/formatPrice";

export default function CarCard({ listing, index = 0, isFavorited = false, onToggleFavorite }) {
  const {
    id, make, model, year, price, type, mileage,
    location, image, priceHistory, verified, source,
  } = listing;

  const isForeign = type === "foreign";

  return (
    <Link href={`/car/${id}`} className="block group">
      <article
        className="relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 animate-scale-in"
        style={{
          animationDelay: `${index * 80}ms`,
          transitionTimingFunction: "var(--ease-spring)",
        }}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={image}
            alt={`${year} ${make} ${model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

          {/* Type badge */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${
            isForeign
              ? "bg-blue-500/90 text-white border-blue-400"
              : "bg-emerald-500/90 text-white border-emerald-400"
          }`}>
            {isForeign ? "Foreign Used" : "Locally Used"}
          </div>

          {/* Verified badge */}
          {verified && (
            <div className="absolute top-3 right-12 flex items-center gap-1 rounded-lg bg-emerald-500 border border-emerald-400 shadow-sm px-2 py-1 text-[11px] font-bold text-white">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(id);
            }}
            className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg shadow-sm border transition-all duration-300 ${
              isFavorited
                ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                : "bg-white/90 text-slate-400 border-slate-200 hover:text-red-400 hover:bg-white"
            }`}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 transition-transform duration-300 ${isFavorited ? "fill-current scale-110" : "scale-100"}`} />
          </button>

          {/* Source tag */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
            <ExternalLink className="h-2.5 w-2.5" />
            {source}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 bg-white">
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-200">
            {make} {model}
          </h3>

          {/* Details row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> {year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5 text-slate-400" /> {mileage.toLocaleString()} km
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {location}
            </span>
          </div>

          {/* Price + Sparkline */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price</div>
              <div className="text-xl font-extrabold text-emerald-600 tabular-nums leading-none">
                {formatPrice(price)}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">6-mo trend</div>
              <Sparkline data={priceHistory} width={100} height={28} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
