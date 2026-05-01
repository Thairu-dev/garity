"""
CLI entry point for the Garity Jiji Kenya scraper.

Usage:
    python -m scraper.run --pages 3 --output scraper/data/listings.json
    python -m scraper.run --pages 1 --skip-details   # quick test run
"""

import argparse
import asyncio
import sys
from pathlib import Path

from scraper.config import DEFAULT_PAGES, DEFAULT_OUTPUT
from scraper.scraper import run_scraper


def main():
    parser = argparse.ArgumentParser(
        description="🚗  Garity — Scrape car listings from Jiji Kenya",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--pages", "-p",
        type=int,
        default=DEFAULT_PAGES,
        help=f"Number of listing pages to scrape (default: {DEFAULT_PAGES})",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output JSON file path (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--skip-details",
        action="store_true",
        help="Skip fetching individual detail pages (faster but less data)",
    )
    parser.add_argument(
        "--max-details",
        type=int,
        default=30,
        help="Maximum number of detail pages to fetch (default: 30)",
    )

    args = parser.parse_args()

    listings = asyncio.run(
        run_scraper(
            pages=args.pages,
            output=args.output,
            skip_details=args.skip_details,
            max_details=args.max_details,
        )
    )

    if not listings:
        sys.exit(1)


if __name__ == "__main__":
    main()
