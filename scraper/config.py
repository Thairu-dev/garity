"""
Scraper configuration constants.
Centralises URLs, headers, delays and output paths so they are easy to tweak.
"""

from pathlib import Path
import random

# ── URLs ────────────────────────────────────────────────────────────────────
BASE_URL = "https://jiji.co.ke"
CARS_URL = f"{BASE_URL}/cars"

# ── Scraping behaviour ──────────────────────────────────────────────────────
DEFAULT_PAGES = 3
REQUEST_DELAY_MIN = 2.0   # seconds – minimum delay between requests
REQUEST_DELAY_MAX = 4.0   # seconds – maximum delay (randomised)
DETAIL_DELAY_MIN = 1.5
DETAIL_DELAY_MAX = 3.0
TIMEOUT = 30              # seconds – per-request timeout

# ── User-Agent rotation pool ────────────────────────────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
]


def get_headers() -> dict:
    """Return a fresh set of browser-like headers with a randomised UA."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }


def get_delay(min_s: float = REQUEST_DELAY_MIN, max_s: float = REQUEST_DELAY_MAX) -> float:
    """Return a random delay between *min_s* and *max_s* seconds."""
    return random.uniform(min_s, max_s)


# ── Output paths ────────────────────────────────────────────────────────────
SCRAPER_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRAPER_DIR / "data"
DEFAULT_OUTPUT = DATA_DIR / "listings.json"
