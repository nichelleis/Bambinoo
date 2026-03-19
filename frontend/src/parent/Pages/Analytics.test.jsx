import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Analytics from "./Analytics";

vi.mock("plotly.js-dist", () => ({
  default: { react: vi.fn() },
}));

vi.mock("../../assets/styleSheets/Analytics.module.css", () => ({
  default: new Proxy(
    {},
    {
      get: (target, prop) => prop,
    },
  ),
}));

describe("Analytics Component", () => {
  const mockChildData = {
    id: 1,
    age: 5,
    gender: "Female",
    measurements: [{ date: "2026-03-19", height: 110, weight: 18 }],
  };

  const mockVaccineData = [
    {
      id: 1,
      vaccine: "MMR",
      date: "2026-01-01",
      status: "Completed",
      nextDue: "-",
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes("/analize")) {
        return Promise.resolve({ json: () => Promise.resolve(mockChildData) });
      }
      if (url.includes("/vaccine")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockVaccineData),
        });
      }
      return Promise.reject("Unknown URL");
    });

    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mock-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("renders loading initially and then child data", async () => {
    render(<Analytics />);

    expect(screen.getByText(/Loading analytics data/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Analytics Dashboard/i)).toBeDefined();
    });

    expect(screen.getByText(/5 years old/i)).toBeDefined();
    expect(screen.getByText(/Female/i)).toBeDefined();

    expect(screen.getByText(/MMR/i)).toBeDefined();
    expect(screen.getByText(/Completed/i)).toBeDefined();
  });
});
