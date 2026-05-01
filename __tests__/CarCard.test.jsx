import { render, screen } from "@testing-library/react";
import CarCard from "../src/components/CarCard/CarCard";

// Mock the Sparkline component as it uses Recharts which can be tricky in JSDOM
jest.mock("../src/components/Sparkline/Sparkline", () => {
  return function MockSparkline() {
    return <div data-testid="mock-sparkline">Sparkline</div>;
  };
});

describe("CarCard Component", () => {
  const mockListing = {
    id: "1",
    make: "Toyota",
    model: "Harrier",
    year: 2018,
    price: 4500000,
    type: "foreign",
    mileage: 45000,
    location: "Mombasa",
    image: "/images/car-1.png",
    priceHistory: [4600000, 4550000, 4500000],
    verified: true,
    source: "Jiji"
  };

  it("renders the car make and model", () => {
    render(<CarCard listing={mockListing} />);
    expect(screen.getByText("Toyota Harrier")).toBeTruthy();
  });

  it("renders the formatted price correctly", () => {
    render(<CarCard listing={mockListing} />);
    // formatPrice converts to Ksh 4,500,000
    // Using a regex to allow for potential whitespace differences
    const priceText = screen.getByText(/4,500,000/);
    expect(priceText).toBeTruthy();
  });

  it("shows the 'Foreign Used' badge when type is foreign", () => {
    render(<CarCard listing={mockListing} />);
    expect(screen.getByText("Foreign Used")).toBeTruthy();
  });

  it("shows the 'Verified' badge when verified is true", () => {
    render(<CarCard listing={mockListing} />);
    expect(screen.getByText("Verified")).toBeTruthy();
  });

  it("renders the location", () => {
    render(<CarCard listing={mockListing} />);
    expect(screen.getByText("Mombasa")).toBeTruthy();
  });
});
