import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserAuthentication from "./UserAuthentication";

beforeEach(() => {
  localStorage.setItem("token", "fake-token");
});

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }),
);

describe("UserAuthentication Component", () => {
  it("renders tabs and search input", () => {
    render(<UserAuthentication />);

    expect(
      screen.getByText("User Authentication & Access Management"),
    ).toBeInTheDocument();

    expect(screen.getByText("Registration Requests")).toBeInTheDocument();
    expect(screen.getByText("Report Requests")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter Registration Number..."),
    ).toBeInTheDocument();
  });

  it("switches tabs when clicked", () => {
    render(<UserAuthentication />);

    const reportsTab = screen.getByText("Report Requests");
    fireEvent.click(reportsTab);

    expect(reportsTab).toHaveClass("active");
  });

  it("shows empty state when no pending registrations", async () => {
    render(<UserAuthentication />);

    const emptyState = await screen.findByText(
      "No pending registrations at this time.",
    );
    expect(emptyState).toBeInTheDocument();
  });
});
