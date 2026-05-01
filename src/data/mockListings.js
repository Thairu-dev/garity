/**
 * Learning Note:
 * This module loads car listings from a JSON file — the same format our Python
 * scraper will output. Using JSON as the storage format means:
 *   1. The scraper writes listings.json → the frontend reads it. No schema mismatch.
 *   2. JSON is language-agnostic, so Python and JS share the exact same data contract.
 *   3. For a proof-of-concept this is fast and simple. When we outgrow it, we swap
 *      this import for a fetch() call to a database-backed API — zero component changes.
 */

import listings from "./listings.json";

export const mockListings = listings;
