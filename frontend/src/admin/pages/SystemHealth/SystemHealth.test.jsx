import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SystemHealth from "./SystemHealth";

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        db_status: "Healthy",
        ml_status: "Loaded",
        cpu_percent: 50,
        mem_percent: 40,
      }),
  }),
);

describe("SystemHealth Component", () => {
  it("renders and shows loading initially", () => {
    render(<SystemHealth />);
    expect(screen.getByText(/Loading diagnostics…/i)).toBeInTheDocument();
  });

  it("fetches data and displays database status", async () => {
    render(<SystemHealth />);

    await waitFor(() => {
      expect(screen.getByText("Healthy")).toBeInTheDocument();
    });

    const dbService = screen
      .getAllByText("Database")
      .find((el) => el.className.includes("sh-service-name"));
    expect(dbService).toBeInTheDocument();
  });
});
