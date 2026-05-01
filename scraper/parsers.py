"""
HTML parsing utilities for Jiji Kenya car listings.
Each function takes a BeautifulSoup element and returns structured data.
"""

import re
import hashlib
from bs4 import BeautifulSoup, Tag
from typing import Optional

# ── Well-known car makes ────────────────────────────────────────────────────
# Used to split the title string "Toyota Harrier 2.0 2019 White" into parts.
KNOWN_MAKES = {
    "Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi",
    "Mercedes-Benz", "Mercedes", "BMW", "Audi", "Volkswagen", "VW",
    "Land Rover", "Range Rover", "Lexus", "Suzuki", "Isuzu",
    "Hyundai", "Kia", "Peugeot", "Ford", "Chevrolet", "Jeep",
    "Porsche", "Volvo", "Daihatsu", "Mini", "Jaguar", "Infiniti",
    "Renault", "Fiat", "Opel", "Chrysler", "Dodge", "Tesla",
}

# ── Price parsing ───────────────────────────────────────────────────────────

def parse_price(text: str) -> Optional[int]:
    """
    Convert a price string like 'KSh 4,500,000' or 'KSh 850,000' to an int.
    Returns None if parsing fails or value is unreasonable.
    """
    if not text:
        return None
    # Remove everything except digits
    digits = re.sub(r"[^\d]", "", text)
    if not digits:
        return None
    value = int(digits)
    # Sanity check: reject prices above 500M KES (likely phone numbers or garbage)
    if value > 500_000_000:
        return None
    return value


# ── Title parsing ───────────────────────────────────────────────────────────

def parse_title(title: str) -> dict:
    """
    Parse a Jiji listing title like:
      'Toyota Harrier 2.0 2019 White'
      'BMW 530i 2019 Pearl'
      'Mercedes-Benz C200 AMG 2020 Black'

    Returns: { make, model, year, color }
    Year and color may be None if not found.
    """
    result = {"make": "", "model": "", "year": None, "color": None}
    if not title:
        return result

    parts = title.strip().split()
    if not parts:
        return result

    # --- Extract make ---
    make = parts[0]
    model_start = 1

    # Handle multi-word makes like "Mercedes-Benz", "Land Rover", "Range Rover"
    if len(parts) > 1:
        two_word = f"{parts[0]} {parts[1]}"
        if two_word in KNOWN_MAKES or two_word.replace("-", "") in {m.replace("-", "") for m in KNOWN_MAKES}:
            make = two_word
            model_start = 2
        # Also handle "Mercedes" → "Mercedes-Benz"
        if parts[0] == "Mercedes" and len(parts) > 1 and parts[1] != "Benz":
            make = "Mercedes-Benz"
            model_start = 1

    result["make"] = make

    # --- Extract year (4-digit number between 1990-2030) ---
    remaining = parts[model_start:]
    year_idx = None
    for i, part in enumerate(remaining):
        if re.match(r"^(19|20)\d{2}$", part):
            result["year"] = int(part)
            year_idx = i
            break

    # --- Model is everything between make and year ---
    if year_idx is not None:
        model_parts = remaining[:year_idx]
        # Everything after year is likely color
        after_year = remaining[year_idx + 1:]
        if after_year:
            result["color"] = " ".join(after_year)
    else:
        model_parts = remaining

    result["model"] = " ".join(model_parts) if model_parts else ""

    return result


# ── Mileage extraction ──────────────────────────────────────────────────────

def extract_mileage(text: str) -> Optional[int]:
    """
    Try to pull a mileage figure from description text.
    Handles patterns like: '45,000km', '45000 km', '45000kms', 'mileage 45000'
    """
    if not text:
        return None

    patterns = [
        r"(\d[\d,]*)\s*km",           # "45,000km" or "45000 km"
        r"mileage\s*[:\-]?\s*(\d[\d,]*)",  # "mileage 45000" or "mileage: 45,000"
        r"(\d[\d,]*)\s*kms",           # "45000kms"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            digits = match.group(1).replace(",", "")
            value = int(digits)
            # Sanity check: mileage should be between 100 and 999,999
            if 100 <= value <= 999_999:
                return value

    return None


# ── Listing card parsing (search results page) ─────────────────────────────

def parse_listing_card(card: Tag, base_url: str = "https://jiji.co.ke") -> Optional[dict]:
    """
    Parse a single listing card element from the Jiji search results page.
    Returns a dict with preview data, or None if the card can't be parsed.
    """
    try:
        # --- Link / URL ---
        # If the card itself is an <a>, use it; otherwise find nested <a>
        if card.name == "a" and card.get("href"):
            link_el = card
        else:
            link_el = card.find("a", href=True)
        if not link_el:
            return None

        relative_url = link_el.get("href", "")
        listing_url = f"{base_url}{relative_url}" if relative_url.startswith("/") else relative_url

        # Generate a stable ID from the URL path only (strip query params)
        url_path = relative_url.split("?")[0]
        listing_id = f"jiji-{hashlib.md5(url_path.encode()).hexdigest()[:10]}"

        # --- Price ---
        price_el = card.select_one("[class*='price']") or card.find("div", string=re.compile(r"KSh"))
        price_text = price_el.get_text(strip=True) if price_el else ""
        price = parse_price(price_text)

        # --- Title ---
        title_el = card.select_one("[class*='title']") or card.select_one("[class*='name']")
        # Fallback: look for the main text link
        if not title_el and link_el:
            # Sometimes the title is in a child of the link
            title_el = link_el.find("div") or link_el.find("span")
        title_text = title_el.get_text(strip=True) if title_el else ""

        # --- Image ---
        img_el = card.find("img")
        image_url = ""
        if img_el:
            image_url = img_el.get("src") or img_el.get("data-src") or img_el.get("data-lazy") or ""

        # --- Description snippet ---
        desc_el = card.select_one("[class*='description']") or card.select_one("[class*='desc']")
        description = desc_el.get_text(strip=True) if desc_el else ""

        # --- Location ---
        location_el = card.select_one("[class*='location']") or card.select_one("[class*='region']")
        location = ""
        if location_el:
            location = location_el.get_text(strip=True)
            # Clean up: remove leading pin emoji / icon text
            location = re.sub(r"^[\U0001F4CD\u2022\s]+", "", location).strip()

        # --- Type (Foreign / Local) ---
        card_text = card.get_text(" ", strip=True).lower()
        if "foreign used" in card_text or "foreign-used" in card_text:
            car_type = "foreign"
        elif "local used" in card_text or "locally used" in card_text or "local-used" in card_text:
            car_type = "local"
        else:
            car_type = "unknown"

        # --- Verified ---
        verified = bool(card.select_one("[class*='verified']") or "verified" in card_text.lower())

        # --- Transmission ---
        if "automatic" in card_text:
            transmission = "Automatic"
        elif "manual" in card_text:
            transmission = "Manual"
        elif "cvt" in card_text:
            transmission = "CVT"
        else:
            transmission = None

        # --- Parse the title ---
        parsed = parse_title(title_text)
        mileage = extract_mileage(description) or extract_mileage(title_text)

        return {
            "id": listing_id,
            "make": parsed["make"],
            "model": parsed["model"],
            "year": parsed["year"],
            "price": price,
            "currency": "KES",
            "type": car_type,
            "mileage": mileage,
            "location": location,
            "image": image_url,
            "priceHistory": [price] if price else [],
            "verified": verified,
            "source": "Jiji Kenya",
            "description": description,
            "sourceUrl": listing_url,
            "transmission": transmission,
            "color": parsed.get("color"),
            "_detail_url": listing_url,  # internal: used to fetch full details
        }

    except Exception:
        return None


# ── Detail page parsing ─────────────────────────────────────────────────────

def parse_detail_page(html: str, partial: dict) -> dict:
    """
    Enrich a partial listing dict with data from the full detail page HTML.
    Updates description, mileage, features, and any missing fields.
    """
    soup = BeautifulSoup(html, "lxml")
    listing = dict(partial)  # copy

    # --- Full description ---
    desc_el = (
        soup.select_one("[class*='description']")
        or soup.select_one("[class*='text--body']")
        or soup.find("div", {"itemprop": "description"})
    )
    if desc_el:
        full_desc = desc_el.get_text(" ", strip=True)
        if len(full_desc) > len(listing.get("description", "")):
            listing["description"] = full_desc

    # --- Extra Attributes ---
    extra_attrs = {}
    attr_divs = soup.select("div[class*='attr'], div[class*='param']")
    for div in attr_divs:
        children = div.find_all("div", recursive=False)
        if len(children) == 2:
            key = children[0].get_text(" ", strip=True)
            value = children[1].get_text(" ", strip=True)
            if key and value and len(key) < 30 and len(value) < 50:
                extra_attrs[key] = value

    listing["attributes"] = extra_attrs

    # --- Attributes table (Year, Mileage, Fuel Type, etc.) ---
    attrs = {}
    attr_items = soup.select("[class*='attribute']") or soup.select("[class*='details'] li")
    for item in attr_items:
        text = item.get_text(" ", strip=True)
        parts = re.split(r"[:\-]\s*", text, maxsplit=1)
        if len(parts) == 2:
            key = parts[0].strip().lower()
            value = parts[1].strip()
            attrs[key] = value

    for row in soup.select("[class*='param']"):
        label_el = row.select_one("[class*='label'], [class*='key'], [class*='name']")
        value_el = row.select_one("[class*='value'], [class*='data']")
        if label_el and value_el:
            attrs[label_el.get_text(strip=True).lower()] = value_el.get_text(strip=True)

    if not listing.get("year") and "year" in attrs:
        year_match = re.search(r"(19|20)\d{2}", attrs["year"])
        if year_match:
            listing["year"] = int(year_match.group())

    if not listing.get("mileage"):
        for key in ("mileage", "kilometres", "km"):
            if key in attrs:
                mileage = extract_mileage(attrs[key])
                if mileage:
                    listing["mileage"] = mileage
                    break
        if not listing.get("mileage") and listing.get("description"):
            listing["mileage"] = extract_mileage(listing["description"])

    if not listing.get("transmission"):
        for key in ("transmission", "gearbox"):
            if key in attrs:
                listing["transmission"] = attrs[key]
                break

    fuel_keys = ("fuel", "fuel type", "fuel_type")
    for key in fuel_keys:
        if key in attrs:
            listing["fuelType"] = attrs[key]
            break

    # --- Features list ---
    features = []
    feature_els = soup.select("[class*='feature'] li, [class*='feature'] span, [class*='amenit'] li")
    for el in feature_els:
        feat = el.get_text(strip=True)
        if feat and len(feat) < 60:
            features.append(feat)

    if features:
        listing["features"] = features

    # --- Multiple Images ---
    images = list(set(re.findall(r'https://pictures-kenya\.jijistatic\.com/[A-Za-z0-9_-]+(?:MTIw|MTYw)[A-Za-z0-9_-]+\.webp', html)))
    if images:
        listing["images"] = images
        # Ensure main image is high res if found
        listing["image"] = images[0]
    else:
        # Fallback to single main image logic if regex misses
        main_img = soup.select_one("[class*='gallery'] img, [class*='slider'] img, [class*='main'] img")
        if main_img:
            better_src = main_img.get("src") or main_img.get("data-src") or ""
            if better_src and "placeholder" not in better_src.lower():
                listing["image"] = better_src
                listing["images"] = [better_src]
        else:
            listing["images"] = [listing.get("image")] if listing.get("image") else []

    # Clean up internal fields
    listing.pop("_detail_url", None)

    return listing
