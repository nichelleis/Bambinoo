import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AIAnalytics from "./NurseAIAnalytics";

vi.mock("../../../components/GrowthPredictionChart", () => ({
  default: () => <div data-testid="growth-chart">Growth Chart</div>,
}));

describe("AIAnalytics Component", () => {
  const mockChild = {
    id: "CH001",
    name: "John Doe",
  };

  it("shows empty state when no child is selected", () => {
    render(<AIAnalytics selectedChild={null} />);

    expect(screen.getByText("No Patient Selected")).toBeInTheDocument();
  });

  it("renders header when a child is selected", () => {
    render(<AIAnalytics selectedChild={mockChild} />);

    expect(
      screen.getByText("AI Clinical Decision Support"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Intelligent analytics for/i)).toBeInTheDocument();
  });

  it("renders AI tabs", () => {
    render(<AIAnalytics selectedChild={mockChild} />);

    expect(screen.getByText("Clinical Insights")).toBeInTheDocument();
    expect(screen.getByText("Diagnostic Support")).toBeInTheDocument();
    expect(screen.getByText("Pattern Analysis")).toBeInTheDocument();
    expect(screen.getByText("Compliance Tracking")).toBeInTheDocument();
    expect(screen.getByText("Growth Prediction")).toBeInTheDocument();
  });

  it("switches to Growth Prediction tab", () => {
    render(<AIAnalytics selectedChild={mockChild} />);

    const growthTab = screen.getByText("Growth Prediction");

    fireEvent.click(growthTab);

    expect(screen.getByTestId("growth-chart")).toBeInTheDocument();
  });
});
