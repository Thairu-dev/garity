import { mockListings } from "@/data/mockListings";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Calendar, Gauge, MapPin, ExternalLink, CheckCircle, Palette, Settings, Car } from "lucide-react";
import Sparkline from "@/components/Sparkline/Sparkline";
import ImageCarousel from "@/components/ImageCarousel/ImageCarousel";
import fs from "fs";
import path from "path";

const SCRAPED_DATA_PATH = path.join(process.cwd(), "scraper", "data", "listings.json");

export default async function CarDetails({ params }) {
  const resolvedParams = await params;
  
  let listing = null;
  
  try {
    if (fs.existsSync(SCRAPED_DATA_PATH)) {
      const raw = fs.readFileSync(SCRAPED_DATA_PATH, "utf-8");
      const data = JSON.parse(raw);
      listing = data.listings?.find((l) => l.id.toString() === resolvedParams.id);
    }
  } catch (err) {
    console.error("Error reading scraped data:", err.message);
  }

  if (!listing) {
    listing = mockListings.find((l) => l.id.toString() === resolvedParams.id);
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Car not found</h1>
        <Link href="/" className="text-emerald-600 font-medium hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  const isForeign = listing.type === "foreign";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center shadow-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="relative w-full md:w-1/2 flex flex-col p-4 md:p-6 bg-white border-r border-slate-100">
            <ImageCarousel 
              images={listing.images || [listing.image]} 
              alt={`${listing.year} ${listing.make} ${listing.model}`} 
            />
            
            <div className={`absolute top-8 left-8 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm z-10 pointer-events-none ${
              isForeign
                ? "bg-blue-500/90 text-white border-blue-400"
                : "bg-emerald-500/90 text-white border-emerald-400"
            }`}>
              {isForeign ? "Foreign Used" : "Locally Used"}
            </div>
            
            {listing.sourceUrl && (
              <div className="absolute top-8 right-8 flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm z-10 pointer-events-none border border-slate-200">
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                Source: {listing.source}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
            
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                {listing.make} {listing.model}
              </h1>
              {listing.verified && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>

            <div className="text-3xl font-black text-emerald-600 mb-8 tabular-nums">
              {formatPrice(listing.price)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Calendar className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Year</div>
                  <div className="font-bold text-slate-900">{listing.year || listing.attributes?.["Year of Manufacture"] || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Gauge className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mileage</div>
                  <div className="font-bold text-slate-900">{listing.mileage ? `${listing.mileage.toLocaleString()} km` : "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Settings className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transmission</div>
                  <div className="font-bold text-slate-900">{listing.transmission || listing.attributes?.["Transmission"] || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Palette className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Color</div>
                  <div className="font-bold text-slate-900">{listing.color || listing.attributes?.["Color"] || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Car className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interior</div>
                  <div className="font-bold text-slate-900">{listing.attributes?.["Interior Color"] || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <MapPin className="w-6 h-6 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</div>
                  <div className="font-bold text-slate-900">{listing.location}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Sparkline */}
            <div className="mb-auto">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                6-Month Price Trend
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Sparkline data={listing.priceHistory} width={250} height={60} strokeWidth={2} />
              </div>
            </div>

            {/* CTA */}
            {listing.sourceUrl ? (
              <a 
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 text-lg flex items-center justify-center gap-2"
              >
                Buy Now
                <ExternalLink className="w-5 h-5 opacity-70" />
              </a>
            ) : (
              <button className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 text-lg">
                Contact Seller
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
