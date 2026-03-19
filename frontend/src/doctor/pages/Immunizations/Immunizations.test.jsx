import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Immunizations from "./Immunizations";

describe("Immunizations Component", () => {
  const mockChild = {
    id: "CH1234567",
    name: "John Doe",
    vaccinations: [
      {
        id: 1,
        vaccine_name: "BCG",
        administered_date: "2026-03-01",
        dose_number: "1st dose",
        batch_number: "B123",
        administered_by: "Dr. Smith",
        notes: "No reaction",
      },
    ],
  };

  it("shows empty state when no child is selected", () => {
    render(<Immunizations selectedChild={null} />);
    expect(screen.getByText(/No Patient Selected/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please search and select a patient/i),
    ).toBeInTheDocument();
  });

  it("renders immunization history when child has vaccinations", () => {
    render(<Immunizations selectedChild={mockChild} />);
    expect(screen.getByText(/Immunization Records/i)).toBeInTheDocument();
    expect(screen.getByText(/BCG/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });

  it("allows typing in the vaccine name input", () => {
    render(<Immunizations selectedChild={mockChild} />);
    const vaccineInput = screen.getByPlaceholderText("Type to search...");
    fireEvent.change(vaccineInput, { target: { value: "OPV" } });
    expect(vaccineInput.value).toBe("OPV");
  });
});
