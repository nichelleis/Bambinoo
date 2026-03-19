import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./DoctorSideNav";

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Doctor Sidebar", () => {
  it("renders sidebar title", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Doctor Portal")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Search Child")).toBeInTheDocument();
    expect(screen.getByText("Messaging")).toBeInTheDocument();
    expect(screen.getByText("AI Analytics")).toBeInTheDocument();
  });

  it("logout button clears localStorage", () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", "test-user");

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    const logoutButton = screen.getByText("Logout");

    fireEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBe(null);
    expect(localStorage.getItem("user")).toBe(null);
  });

  it("logout navigates to home page", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    const logoutButton = screen.getByText("Logout");

    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
