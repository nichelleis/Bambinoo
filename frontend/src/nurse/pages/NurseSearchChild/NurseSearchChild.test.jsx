import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import NurseSearchChild from "./NurseSearchChild";

vi.mock("axios");

const mockChildren = [
  {
    id: 1,
    name: "Alice",
    age: 5,
    gender: "Female",
    parent: "Parent A",
    phone: "12345",
    moh_id: "MOH001",
    allergies: ["Peanuts"],
  },
  {
    id: 2,
    name: "Bob",
    age: 6,
    gender: "Male",
    parent: "Parent B",
    phone: "67890",
    moh_id: "MOH002",
    allergies: [],
  },
];

describe("NurseSearchChild Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockChildren });
    localStorage.clear();
  });

  it("renders and shows children", async () => {
    render(<NurseSearchChild />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    expect(screen.getByText("2 children found")).toBeInTheDocument();
  });

  it("filters children based on search", async () => {
    render(<NurseSearchChild />);

    await waitFor(() => screen.getByText("Alice"));

    fireEvent.change(
      screen.getByPlaceholderText(/search by child name or id/i),
      {
        target: { value: "Bob" },
      },
    );

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("1 children found")).toBeInTheDocument();
  });

  it("selects and clears a child", async () => {
    render(<NurseSearchChild />);

    await waitFor(() => screen.getByText("Alice"));

    fireEvent.click(screen.getByText("Alice"));

    expect(screen.getByText("CURRENTLY SELECTED")).toBeInTheDocument();
    expect(
      screen.getByText("Alice", { selector: "strong" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("selectedChild")).toContain("Alice");

    fireEvent.click(screen.getByText("Clear"));

    expect(screen.queryByText("CURRENTLY SELECTED")).not.toBeInTheDocument();
    expect(localStorage.getItem("selectedChild")).toBeNull();
  });
});
