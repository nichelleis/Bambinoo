import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIAnalytics from "./AIAnalytics";

vi.mock("../../components/GrowthPredictionChart", () => ({
  default: () => <div data-testid="growth-chart">Mock Growth Chart</div>,
}));

describe("AIAnalytics Component", () => {
  const mockHtmlResult = "<p>Nutrition Plan Generated</p>";

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mock-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, html: mockHtmlResult }),
      }),
    );
  });

  it("renders tabs and switches correctly", () => {
    render(<AIAnalytics />);

    expect(screen.getByTestId("growth-chart")).toBeDefined();

    const growthButton = screen.getByRole("button", {
      name: /Growth Prediction/i,
    });
    expect(growthButton.className).toContain("active");

    const nutritionButton = screen.getByRole("button", {
      name: /Nutrition Plan/i,
    });
    fireEvent.click(nutritionButton);

    expect(nutritionButton.className).toContain("active");
    expect(screen.queryByTestId("growth-chart")).toBeNull();
  });

  it("handles nutrition plan generation", async () => {
    render(<AIAnalytics />);
    fireEvent.click(screen.getByText(/Nutrition Plan/i));

    const generateBtn = screen.getByText(/Generate Plan/i);
    fireEvent.click(generateBtn);

    expect(screen.getByText(/Analyzing…/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText(/Nutrition Plan Generated/i)).toBeDefined();
    });
  });
});
