/**
 * Learning Note:
 * RefactorLog.md documents hypothetical improvements for the next iteration.
 * Keeping a refactor log is a professional practice that helps teams plan
 * technical debt reduction and prioritize optimizations. Each entry explains
 * the current state, the proposed improvement, and the expected impact.
 */

# Garity Refactor Log

> Documenting 3 hypothetical improvements for the next iteration.  
> **Date:** April 28, 2026 | **Version:** 1.0.0

---

## Improvement 1: Server Components + Streaming for Data Fetching

### Current State
The home page (`page.js`) is a client component (`"use client"`) because it manages `searchQuery` state shared between Hero and CarGrid. All 12 car listings are loaded at once via a static import of `mockListings.js`.

### Proposed Improvement
When switching to a real API, refactor the data fetching to use **React Server Components (RSC)** with **streaming**:

```jsx
// page.js (Server Component — no "use client")
import { Suspense } from "react";

async function getListings() {
  const res = await fetch("https://api.garity.co.ke/listings", {
    next: { revalidate: 60 }, // ISR: refresh every 60 seconds
  });
  return res.json();
}

export default async function Home() {
  const data = await getListings();
  return (
    <>
      <Hero />
      <Suspense fallback={<CarGridSkeleton />}>
        <CarGrid listings={data.listings} />
      </Suspense>
    </>
  );
}
```

### Expected Impact
- **TTFB improvement:** Server fetches data before sending HTML — no client-side loading spinner
- **SEO improvement:** Car listing content is in the initial HTML (crawlable by Google)
- **Bundle size reduction:** Server Components don't ship JavaScript to the client
- **Streaming:** `<Suspense>` lets the Hero render immediately while listings load

### Tradeoff
Search state would need to move to URL query parameters (`?q=toyota`) instead of `useState`, requiring `useSearchParams()` in a client component wrapper.

---

## Improvement 2: Virtual Scrolling for Large Listing Sets

### Current State
All filtered listings render simultaneously in the DOM. With 12 mock listings, this is fine. But a real aggregator might have 1,000+ listings.

### Proposed Improvement
Implement **virtual scrolling** using `react-window` or `@tanstack/react-virtual`:

```jsx
import { FixedSizeGrid } from "react-window";

function VirtualCarGrid({ listings, columnCount = 3 }) {
  const rowCount = Math.ceil(listings.length / columnCount);

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={380}
      height={800}
      rowCount={rowCount}
      rowHeight={420}
      width={1200}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        const listing = listings[index];
        if (!listing) return null;
        return (
          <div style={style}>
            <CarCard listing={listing} />
          </div>
        );
      }}
    </FixedSizeGrid>
  );
}
```

### Expected Impact
- **DOM nodes:** Drops from 1,000+ cards to ~15 visible cards at any time
- **Memory usage:** ~90% reduction for large datasets
- **Scroll performance:** Maintains 60fps even with thousands of listings
- **Initial render:** Near-instant regardless of dataset size

### Tradeoff
- Staggered entrance animations won't work with virtual scrolling (cards mount/unmount as you scroll)
- Requires fixed card heights, which limits flexible card designs
- Search engines can't crawl virtualized content (but we'd use SSR for that)

---

## Improvement 3: Image Optimization Pipeline

### Current State
We use 4 static PNG images stored in `public/images/`, served unprocessed. Each PNG is ~600KB. Total image payload: ~2.4MB.

### Proposed Improvement
Implement a full image optimization pipeline:

1. **`next/image` with blur placeholders:**
```jsx
import carImage from "@/assets/car-1.webp";

<Image
  src={carImage}
  alt="Toyota Harrier"
  placeholder="blur"  // Auto-generates blurDataURL at build time
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={80}
/>
```

2. **AVIF/WebP format conversion:** Next.js automatically serves AVIF (smallest) or WebP based on browser support.

3. **Remote image loader for scraped images:**
```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.cheki.co.ke" },
      { protocol: "https", hostname: "images.jiji.co.ke" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};
```

### Expected Impact
- **Image payload:** ~2.4MB → ~300KB (87.5% reduction)
- **LCP improvement:** Blur placeholder shown instantly, real image streams in
- **Bandwidth savings:** AVIF is 50% smaller than WebP, which is 30% smaller than PNG
- **Responsive images:** `sizes` attribute ensures mobile devices download smaller variants

### Tradeoff
- AVIF encoding is CPU-intensive at build time (adds ~10s to builds)
- Remote images from scraped sources may have inconsistent aspect ratios
- Need to handle image load failures gracefully (fallback placeholder)

---

## Priority Matrix

| Improvement | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Server Components + Streaming | 🟢 High | 🟡 Medium | **P1** — do when adding API |
| Virtual Scrolling | 🟡 Medium | 🟡 Medium | **P2** — do when listings > 100 |
| Image Optimization | 🟢 High | 🟢 Low | **P1** — do immediately with real images |
