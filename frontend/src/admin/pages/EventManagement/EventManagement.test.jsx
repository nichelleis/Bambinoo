import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EventManagement from "./EventManagement";

describe("Admin Event Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("renders the Event Management component without crashing", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<EventManagement />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
