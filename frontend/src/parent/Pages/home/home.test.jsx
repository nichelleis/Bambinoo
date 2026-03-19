import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Home from "./home";

vi.mock("../../Components/OverviewComponent", () => ({
  default: () => <div>Overview</div>,
}));
vi.mock("../../Components/UpcomingEventComponent", () => ({
  default: () => <div>UpcomingEvent</div>,
}));
vi.mock("../../Components/MilestoneSummary", () => ({
  default: () => <div>Milestones</div>,
}));
vi.mock("../../Components/ImmunizationSummary", () => ({
  default: () => <div>Immunization</div>,
}));
vi.mock("../../Components/HealthNote", () => ({
  default: () => <div>HealthNote</div>,
}));

describe("Home Component", () => {
  it("renders all sections", () => {
    render(<Home />);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("UpcomingEvent")).toBeDefined();
    expect(screen.getByText("Milestones")).toBeDefined();
    expect(screen.getByText("Immunization")).toBeDefined();
    expect(screen.getByText("HealthNote")).toBeDefined();
  });
});
