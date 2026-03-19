import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CHDRView from "./CHDRView";

vi.mock("plotly.js-dist", () => ({ default: { react: vi.fn() } }));

const mockChild = {
  name: "Alice",
  date_of_birth: "2018-05-10",
  gender: "Female",
  allergies: ["Peanuts", "Dust"],
  activeConditions: ["Asthma"],
  vaccinations: [
    {
      vaccine_name: "MMR",
      administered_date: "2019-06-12",
      status: "completed",
      dose_number: 1,
    },
  ],
  healthNotes: [
    {
      title: "Checkup",
      record_type: "Routine",
      severity: "Mild",
      record_date: "2020-05-01",
    },
  ],
  growthHistory: [
    { date: "2023-01-01", weight: 20, height: 110, head: 48 },
    { date: "2022-06-01", weight: 18, height: 105, head: 46 },
  ],
};

describe("CHDRView Component", () => {
  it("renders empty state when no child selected", () => {
    render(<CHDRView selectedChild={null} />);
    expect(screen.getByText("No Patient Selected")).toBeDefined();
    expect(
      screen.getByText(/Please search and select a patient/),
    ).toBeDefined();
  });

  it("renders child basic info", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Female")).toBeDefined();
    expect(
      screen.getByText("Child Health Development Record (CHDR)"),
    ).toBeDefined();
  });

  it("renders allergies", () => {
    render(<CHDRView selectedChild={mockChild} />);
    mockChild.allergies.forEach((allergy) => {
      expect(screen.getByText(allergy)).toBeDefined();
    });
  });

  it("renders latest growth measurements", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(screen.getByText("20")).toBeDefined();
    expect(screen.getByText("110")).toBeDefined();
  });

  it("renders vaccination info", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(screen.getAllByText("MMR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dose 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("completed").length).toBeGreaterThan(0);
  });

  it("renders active conditions", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(screen.getByText("Asthma")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("renders health notes", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(screen.getByText("Checkup")).toBeDefined();
    expect(screen.getByText("Mild")).toBeDefined();
  });

  it("renders chart containers", () => {
    render(<CHDRView selectedChild={mockChild} />);
    expect(document.getElementById("doctorHeightChart")).toBeDefined();
    expect(document.getElementById("doctorWeightChart")).toBeDefined();
    expect(document.getElementById("BMIChart")).toBeDefined();
  });
});
