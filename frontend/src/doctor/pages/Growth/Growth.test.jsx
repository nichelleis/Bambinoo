import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Growth from "./Growth.jsx";

const mockChild = {
  id: "CH1234567",
  name: "John Doe",
  growthHistory: [
    {
      id: 1,
      record_date: "2026-03-18",
      weight: 12.5,
      height: 85,
      head: 50,
      notes: "Previous record",
    },
  ],
};

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 2 }),
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders Growth component with selected child and history", () => {
  render(<Growth selectedChild={mockChild} />);

  expect(
    screen.getByRole("heading", { name: /Growth Data/i }),
  ).toBeInTheDocument();
  expect(screen.getByText("John Doe")).toBeInTheDocument();

  expect(screen.getByText(/12.5 kg/i)).toBeInTheDocument();
  expect(screen.getByText(/85 cm/i)).toBeInTheDocument();
  expect(screen.getByText(/50 cm/i)).toBeInTheDocument();
  expect(screen.getByText(/Previous record/i)).toBeInTheDocument();
});

test("allows typing in growth form inputs", () => {
  render(<Growth selectedChild={mockChild} />);

  const dateInput = screen.getByLabelText(/Date/i);
  const weightInput = screen.getByLabelText(/Weight/i);
  const heightInput = screen.getByLabelText(/Height/i);
  const headInput = screen.getByLabelText(/Head Circumference/i);
  const notesInput = screen.getByLabelText(/Notes/i);

  fireEvent.change(dateInput, { target: { value: "2026-03-19" } });
  fireEvent.change(weightInput, { target: { value: "13.2" } });
  fireEvent.change(heightInput, { target: { value: "86.0" } });
  fireEvent.change(headInput, { target: { value: "51.0" } });
  fireEvent.change(notesInput, { target: { value: "New growth note" } });

  expect(dateInput.value).toBe("2026-03-19");
  expect(weightInput.value).toBe("13.2");
  expect(heightInput.value).toBe("86.0");
  expect(headInput.value).toBe("51.0");
  expect(notesInput.value).toBe("New growth note");
});

test("submits growth form and adds new record to history", async () => {
  render(<Growth selectedChild={mockChild} />);

  fireEvent.change(screen.getByLabelText(/Date/i), {
    target: { value: "2026-03-19" },
  });
  fireEvent.change(screen.getByLabelText(/Weight/i), {
    target: { value: "13.2" },
  });
  fireEvent.change(screen.getByLabelText(/Height/i), {
    target: { value: "86.0" },
  });
  fireEvent.change(screen.getByLabelText(/Head Circumference/i), {
    target: { value: "51.0" },
  });
  fireEvent.change(screen.getByLabelText(/Notes/i), {
    target: { value: "New growth note" },
  });

  fireEvent.click(screen.getByText(/Save Growth Data/i));

  await waitFor(() =>
    expect(
      screen.getByText(/Growth record saved successfully/i),
    ).toBeInTheDocument(),
  );

  expect(screen.getByText(/13\.2? kg/i)).toBeInTheDocument();
  expect(screen.getByText(/86\.0? cm/i)).toBeInTheDocument();
  expect(screen.getByText(/51\.0? cm/i)).toBeInTheDocument();
  expect(screen.getByText(/New growth note/i)).toBeInTheDocument();
});
