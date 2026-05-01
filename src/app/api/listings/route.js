/**
 * API Route: GET /api/listings
 *
 * Serves scraped car listings from the JSON file produced by the Python scraper.
 * Falls back to mockListings if the scraped data file doesn't exist yet.
 *
 * Query params:
 *   ?make=Toyota       — filter by make (case-insensitive)
 *   ?type=foreign      — filter by type (foreign | local)
 *   ?maxPrice=5000000  — filter by max price
 *   ?minPrice=1000000  — filter by min price
 *   ?limit=20          — limit results
 *   ?offset=0          — pagination offset
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { mockListings } from "@/data/mockListings";

const SCRAPED_DATA_PATH = path.join(
  process.cwd(),
  "scraper",
  "data",
  "listings.json"
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  let listings = [];
  let meta = {
    source: "mock",
    scrapedAt: null,
    totalBeforeFilter: 0,
  };

  // Try to read scraped data
  try {
    if (fs.existsSync(SCRAPED_DATA_PATH)) {
      const raw = fs.readFileSync(SCRAPED_DATA_PATH, "utf-8");
      const data = JSON.parse(raw);

      listings = data.listings || [];
      meta.source = data.source || "jiji.co.ke";
      meta.scrapedAt = data.scrapedAt || null;
    }
  } catch (err) {
    console.error("Failed to read scraped data, falling back to mock:", err.message);
  }

  // Fall back to mock data if no scraped data available
  if (listings.length === 0) {
    listings = mockListings.map((l) => ({
      ...l,
      sourceUrl: null,
      transmission: null,
      fuelType: null,
      features: [],
      images: [l.image],
      attributes: {},
    }));
    meta.source = "mock";
  }

  meta.totalBeforeFilter = listings.length;

  // --- Apply filters ---
  const make = searchParams.get("make");
  const type = searchParams.get("type");
  const maxPrice = searchParams.get("maxPrice");
  const minPrice = searchParams.get("minPrice");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "0", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (make) {
    listings = listings.filter(
      (l) => l.make && l.make.toLowerCase() === make.toLowerCase()
    );
  }

  if (type) {
    listings = listings.filter((l) => l.type === type);
  }

  if (maxPrice) {
    const max = parseInt(maxPrice, 10);
    if (!isNaN(max)) {
      listings = listings.filter((l) => l.price && l.price <= max);
    }
  }

  if (minPrice) {
    const min = parseInt(minPrice, 10);
    if (!isNaN(min)) {
      listings = listings.filter((l) => l.price && l.price >= min);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    listings = listings.filter((l) => {
      const text = `${l.make} ${l.model} ${l.description || ""}`.toLowerCase();
      return text.includes(q);
    });
  }

  const totalFiltered = listings.length;

  // --- Pagination ---
  if (offset > 0) {
    listings = listings.slice(offset);
  }
  if (limit > 0) {
    listings = listings.slice(0, limit);
  }

  return NextResponse.json({
    meta: {
      ...meta,
      totalFiltered,
      returned: listings.length,
      offset,
      limit: limit || null,
    },
    listings,
  });
}
