import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Milestones from "./MileStones";

vi.stubGlobal("localStorage", {
  getItem: vi.fn(() => "mock-token"),
});

describe("Milestones Component", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn((url) => {
      if (url.includes("age-groups")) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id: "all" }, { id: 12 }]),
        });
      }
      if (url.includes("milestones")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              Motor: [
                { id: 1, description: "Rolls over", completed: false },
                { id: 2, description: "Crawls", completed: true },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial empty state while fetching", () => {
    render(<Milestones />);
    expect(screen.getByText(/Development Milestones/i)).toBeDefined();
  });

  it("renders milestones after fetch", async () => {
    render(<Milestones />);

    await waitFor(() => {
      expect(screen.getByText(/Motor Skills/i)).toBeDefined();
      expect(screen.getByText(/Rolls over/i)).toBeDefined();
      expect(screen.getByText(/Crawls/i)).toBeDefined();
    });
  });
});
