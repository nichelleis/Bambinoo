import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Profile from "./Profile";

vi.stubGlobal("localStorage", {
  getItem: vi.fn(() => "mock-token"),
});

describe("Profile Component", () => {
  it("renders loading initially", () => {
    render(<Profile />);
    expect(screen.getByText(/Loading.../i)).toBeDefined();
  });

  it("renders profile data after fetch", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            child: {
              name: "Tommy",
              dob: "2020-03-19",
              gender: "Male",
              reg_number: "C123",
            },
            birth: {
              weight: 3.2,
              length: 50,
              head: 35,
              hospital: "City Hospital",
              location: "Colombo",
              delivery: "Normal",
              surgery: "None",
            },
            background: { nationality: "Sri Lankan", language: "Sinhala" },
            parent: {
              name: "John Doe",
              email: "john@test.com",
              phone: "1234567890",
              Address: "123 Street",
            },
          }),
      }),
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/Tommy/i)).toBeDefined();
      expect(screen.getByText(/Reg. C123/i)).toBeDefined();
      expect(screen.getByText(/City Hospital/i)).toBeDefined();
      expect(screen.getByText(/John Doe/i)).toBeDefined();
    });
  });
});
