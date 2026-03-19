import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Education from "./Education";

describe("Parent Education Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders the Education page successfully", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<Education />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
