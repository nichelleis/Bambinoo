import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import ManageUsers from "./ManageUsers";

describe("Admin Manage Users Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders the user management page", () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(<ManageUsers />);
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("fetches and displays the users in the table", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          username: "Dr. Emily",
          email: "emily@doc.com",
          role: "doctor",
          moh_id: "MOH-120",
        },
        {
          id: 2,
          username: "Parent John",
          email: "john@parent.com",
          role: "parent",
          moh_id: "",
        },
      ],
    });

    render(<ManageUsers />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Emily")).toBeInTheDocument();
      expect(screen.getByText("MOH-120")).toBeInTheDocument();
      expect(screen.getByText("Parent John")).toBeInTheDocument();
    });
  });
});
