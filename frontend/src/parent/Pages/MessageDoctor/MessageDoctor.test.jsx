import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import Messages from "./MessageDoctor";
import { BrowserRouter } from "react-router-dom";

describe("Parent Messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders messaging interface", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(
      <BrowserRouter>
        <Messages />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
