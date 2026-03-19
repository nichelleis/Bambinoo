import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import AdminDashboard from "./AdminDashboard";
import { BrowserRouter } from "react-router-dom";

vi.mock("recharts", async () => {
  const OriginalRechartsModule = await vi.importActual("recharts");
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    PieChart: () => <div data-testid="pie-chart" />,
    AreaChart: () => <div data-testid="area-chart" />,
  };
});

describe("Admin Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders loading state for numbers initially", () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );
    expect(screen.getAllByText("...")).toHaveLength(4);
  });

  it("renders admin statistics after fetching data successfully", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        adminName: "Super Admin",
        totalUsers: 154,
        activeDoctors: 12,
        totalChildren: 89,
        totalEvents: 3,
        chartData: [],
        recentUsers: [],
        actionRequired: [],
        registrationData: [],
      }),
    });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Super Admin")).toBeInTheDocument();
      expect(screen.getByText("154")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });
});
