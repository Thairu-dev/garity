import { formatPrice, formatCompactPrice } from "../src/utils/formatPrice";

describe("formatPrice utilities", () => {
  describe("formatPrice", () => {
    it("should format a number as Kenyan Shillings with commas", () => {
      // Different JS environments handle the non-breaking space differently
      // So we replace the unicode space with a regular space just for testing, or use a flexible matcher
      const formatted = formatPrice(4850000).replace(/\s/g, ' ');
      expect(formatted).toMatch(/^K(ES|sh)\s4,850,000$/);
    });

    it("should handle zero correctly", () => {
      const formatted = formatPrice(0).replace(/\s/g, ' ');
      expect(formatted).toMatch(/^K(ES|sh)\s0$/);
    });
  });

  describe("formatCompactPrice", () => {
    it("should format millions with an M suffix", () => {
      expect(formatCompactPrice(1500000)).toBe("1.5M");
      expect(formatCompactPrice(4000000)).toBe("4.0M");
    });

    it("should format thousands with a K suffix", () => {
      expect(formatCompactPrice(850000)).toBe("850K");
      expect(formatCompactPrice(1500)).toBe("2K"); // 1.5K -> 2K because toFixed(0) rounds up
    });

    it("should return the exact string for values under 1000", () => {
      expect(formatCompactPrice(500)).toBe("500");
    });
  });
});
