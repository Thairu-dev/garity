"""
Main scraper for Jiji Kenya car listings.

Strategy 1 (fast):  httpx + BeautifulSoup — plain HTTP with browser-like headers.
Strategy 2 (fallback):  Playwright headless Chromium — used when Cloudflare blocks us.
"""

import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from scraper.config import (
    BASE_URL,
    CARS_URL,
    DEFAULT_PAGES,
    TIMEOUT,
    get_headers,
    get_delay,
    DETAIL_DELAY_MIN,
    DETAIL_DELAY_MAX,
    DATA_DIR,
    DEFAULT_OUTPUT,
)
from scraper.parsers import parse_listing_card, parse_detail_page

import sys
import io

# Force UTF-8 output on Windows to avoid cp1252 encoding errors with Rich
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

console = Console()


# ── httpx strategy ──────────────────────────────────────────────────────────

async def fetch_page_httpx(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """Fetch a single page via httpx.  Returns HTML or None on failure."""
    try:
        resp = await client.get(url, headers=get_headers(), timeout=TIMEOUT, follow_redirects=True)
        if resp.status_code == 200:
            return resp.text
        console.print(f"  [yellow]⚠ HTTP {resp.status_code} for {url}[/yellow]")
        return None
    except httpx.HTTPError as exc:
        console.print(f"  [red]✗ Request failed: {exc}[/red]")
        return None


async def scrape_listings_httpx(pages: int = DEFAULT_PAGES) -> list[dict]:
    """Scrape listing cards from the search results pages via httpx."""
    listings: list[dict] = []

    async with httpx.AsyncClient() as client:
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold cyan]{task.description}"),
            BarColumn(bar_width=30),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching listing pages…", total=pages)

            for page_num in range(1, pages + 1):
                url = f"{CARS_URL}?page={page_num}"
                progress.update(task, description=f"Page {page_num}/{pages}")

                html = await fetch_page_httpx(client, url)
                if html is None:
                    # Cloudflare block likely → signal caller to fall back
                    return []

                soup = BeautifulSoup(html, "lxml")

                # Jiji wraps each advert in a div/article with a link.
                # We look for common container patterns.
                cards = (
                    soup.select("[class*='advert-list'] [class*='item']")
                    or soup.select("[class*='listing'] article")
                    or soup.select("a[href*='/cars/']")
                )

                if not cards:
                    # Maybe the HTML is a Cloudflare challenge page
                    if "challenge" in html.lower() or "ray id" in html.lower():
                        console.print("[yellow]⚠ Cloudflare challenge detected — switching to browser mode[/yellow]")
                        return []
                    console.print(f"  [yellow]⚠ No cards found on page {page_num}[/yellow]")
                    continue

                page_count = 0
                for card in cards:
                    parsed = parse_listing_card(card, BASE_URL)
                    if parsed and parsed.get("price"):
                        listings.append(parsed)
                        page_count += 1

                console.print(f"  [green]✓ Page {page_num}: {page_count} listings[/green]")
                progress.advance(task)

                if page_num < pages:
                    await asyncio.sleep(get_delay())

    return listings


# ── Playwright fallback strategy ────────────────────────────────────────────

async def scrape_listings_playwright(pages: int = DEFAULT_PAGES) -> list[dict]:
    """Scrape listing cards using a headless browser (Playwright)."""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        console.print("[red]✗ Playwright not installed. Run: pip install playwright && playwright install chromium[/red]")
        return []

    listings: list[dict] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=get_headers()["User-Agent"],
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        with Progress(
            SpinnerColumn(),
            TextColumn("[bold cyan]{task.description}"),
            BarColumn(bar_width=30),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching listing pages (browser)…", total=pages)

            for page_num in range(1, pages + 1):
                url = f"{CARS_URL}?page={page_num}"
                progress.update(task, description=f"Page {page_num}/{pages} (browser)")

                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=TIMEOUT * 1000)
                    # Wait a bit for JS rendering
                    await page.wait_for_timeout(3000)
                except Exception as exc:
                    console.print(f"  [red]✗ Browser navigation failed: {exc}[/red]")
                    continue

                html = await page.content()
                soup = BeautifulSoup(html, "lxml")

                cards = (
                    soup.select("[class*='advert-list'] [class*='item']")
                    or soup.select("[class*='listing'] article")
                    or soup.select("a[href*='/cars/']")
                )

                page_count = 0
                for card in cards:
                    parsed = parse_listing_card(card, BASE_URL)
                    if parsed and parsed.get("price"):
                        listings.append(parsed)
                        page_count += 1

                console.print(f"  [green]✓ Page {page_num}: {page_count} listings[/green]")
                progress.advance(task)

                if page_num < pages:
                    await asyncio.sleep(get_delay())

        await browser.close()

    return listings


# ── Detail enrichment ───────────────────────────────────────────────────────

async def enrich_listings(
    listings: list[dict],
    use_browser: bool = False,
    max_details: int = 30,
) -> list[dict]:
    """
    Visit individual listing pages to fill in missing fields
    (full description, mileage, features, etc.).
    Only enriches listings that have a _detail_url and are missing data.
    Limited to *max_details* requests to be respectful.
    """
    to_enrich = [l for l in listings if l.get("_detail_url")][:max_details]
    if not to_enrich:
        return listings

    console.print(f"\n[bold]Enriching {len(to_enrich)} listings with detail pages…[/bold]")

    if use_browser:
        enriched = await _enrich_playwright(to_enrich)
    else:
        enriched = await _enrich_httpx(to_enrich)

    # Merge enriched data back
    enriched_map = {l["id"]: l for l in enriched}
    result = []
    for l in listings:
        if l["id"] in enriched_map:
            result.append(enriched_map[l["id"]])
        else:
            # Remove internal field even if not enriched
            clean = dict(l)
            clean.pop("_detail_url", None)
            result.append(clean)

    return result


async def _enrich_httpx(listings: list[dict]) -> list[dict]:
    enriched = []
    async with httpx.AsyncClient() as client:
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold cyan]{task.description}"),
            BarColumn(bar_width=30),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching details…", total=len(listings))

            for i, listing in enumerate(listings):
                url = listing["_detail_url"]
                progress.update(task, description=f"Detail {i+1}/{len(listings)}")

                html = await fetch_page_httpx(client, url)
                if html:
                    enriched.append(parse_detail_page(html, listing))
                else:
                    clean = dict(listing)
                    clean.pop("_detail_url", None)
                    enriched.append(clean)

                progress.advance(task)
                await asyncio.sleep(get_delay(DETAIL_DELAY_MIN, DETAIL_DELAY_MAX))

    return enriched


async def _enrich_playwright(listings: list[dict]) -> list[dict]:
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        console.print("[red]✗ Playwright not installed[/red]")
        return listings

    enriched = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=get_headers()["User-Agent"],
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        with Progress(
            SpinnerColumn(),
            TextColumn("[bold cyan]{task.description}"),
            BarColumn(bar_width=30),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching details (browser)…", total=len(listings))

            for i, listing in enumerate(listings):
                url = listing["_detail_url"]
                progress.update(task, description=f"Detail {i+1}/{len(listings)} (browser)")

                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=TIMEOUT * 1000)
                    await page.wait_for_timeout(2000)
                    html = await page.content()
                    enriched.append(parse_detail_page(html, listing))
                except Exception:
                    clean = dict(listing)
                    clean.pop("_detail_url", None)
                    enriched.append(clean)

                progress.advance(task)
                await asyncio.sleep(get_delay(DETAIL_DELAY_MIN, DETAIL_DELAY_MAX))

        await browser.close()

    return enriched


# ── Main orchestrator ───────────────────────────────────────────────────────

async def run_scraper(
    pages: int = DEFAULT_PAGES,
    output: Optional[Path] = None,
    skip_details: bool = False,
    max_details: int = 30,
) -> list[dict]:
    """
    Full scraping pipeline:
    1. Try httpx
    2. Fall back to Playwright if blocked
    3. Enrich with detail pages
    4. Save to JSON
    """
    output = output or DEFAULT_OUTPUT
    start_time = time.time()

    console.print(f"\n[bold green]🚗  Garity — Jiji Kenya Scraper[/bold green]")
    console.print(f"   Pages: {pages}  |  Output: {output}\n")

    # Step 1: Scrape listing pages
    console.print("[bold]Step 1/3: Scraping listing pages…[/bold]")
    use_browser = False
    listings = await scrape_listings_httpx(pages)

    if not listings:
        console.print("[yellow]httpx strategy returned no results — trying Playwright…[/yellow]\n")
        use_browser = True
        listings = await scrape_listings_playwright(pages)

    if not listings:
        console.print("[red]✗ No listings found with either strategy.[/red]")
        return []

    console.print(f"\n[green]✓ Found {len(listings)} raw listings from {pages} pages[/green]")

    # Deduplicate by listing ID (Jiji can show the same promoted listing across pages)
    seen_ids = set()
    unique_listings = []
    for l in listings:
        if l["id"] not in seen_ids:
            seen_ids.add(l["id"])
            unique_listings.append(l)
    listings = unique_listings

    if len(seen_ids) < len(listings) + (len(listings) - len(unique_listings)):
        console.print(f"[dim]  Removed {len(seen_ids)} duplicates → {len(listings)} unique[/dim]")
    console.print(f"[green]✓ {len(listings)} unique listings[/green]\n")

    # Step 2: Enrich with detail pages
    if not skip_details:
        console.print("[bold]Step 2/3: Enriching with detail pages…[/bold]")
        listings = await enrich_listings(listings, use_browser=use_browser, max_details=max_details)
        console.print(f"[green]✓ Enriched up to {min(max_details, len(listings))} listings[/green]\n")
    else:
        console.print("[dim]Step 2/3: Skipping detail enrichment (--skip-details)[/dim]\n")
        # Clean internal fields
        for l in listings:
            l.pop("_detail_url", None)

    # Step 3: Save to JSON
    console.print("[bold]Step 3/3: Saving results…[/bold]")
    output.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "scrapedAt": datetime.now(timezone.utc).isoformat(),
        "source": "jiji.co.ke",
        "totalListings": len(listings),
        "listings": listings,
    }

    output.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    console.print(f"[green]✓ Saved {len(listings)} listings to {output}[/green]")

    elapsed = time.time() - start_time
    console.print(f"\n[bold]Done in {elapsed:.1f}s[/bold] 🎉\n")

    return listings
