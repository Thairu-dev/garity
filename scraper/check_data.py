"""Quick data quality check."""
import json

data = json.load(open("scraper/data/listings.json", "r", encoding="utf-8"))
listings = data["listings"]

# Print first enriched listing
print(json.dumps(listings[0], indent=2))

# Stats
print("\n--- Data Quality Stats ---")
print(f"Total listings: {data['totalListings']}")
print(f"Scraped at: {data['scrapedAt']}")
print(f"With mileage: {sum(1 for x in listings if x.get('mileage'))}")
print(f"With description (>20 chars): {sum(1 for x in listings if len(x.get('description', '')) > 20)}")
print(f"Verified: {sum(1 for x in listings if x.get('verified'))}")
print(f"Foreign used: {sum(1 for x in listings if x.get('type') == 'foreign')}")
print(f"Local used: {sum(1 for x in listings if x.get('type') == 'local')}")
print(f"With features: {sum(1 for x in listings if x.get('features'))}")
print(f"With transmission: {sum(1 for x in listings if x.get('transmission'))}")
print(f"With image URL: {sum(1 for x in listings if x.get('image'))}")

# Price range
prices = [x["price"] for x in listings if x.get("price")]
if prices:
    print(f"Price range: KES {min(prices):,} — {max(prices):,}")

# Top makes
from collections import Counter
makes = Counter(x.get("make", "Unknown") for x in listings)
print(f"\nTop makes: {dict(makes.most_common(8))}")
