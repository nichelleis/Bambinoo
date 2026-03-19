import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import NurseMessages from "./NurseMessages";
import { BrowserRouter } from "react-router-dom";

describe("Nurse Messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders nurse messaging interface", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(
      <BrowserRouter>
        <NurseMessages />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
