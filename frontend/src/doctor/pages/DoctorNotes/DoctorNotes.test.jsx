import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClinicalNotes from "./DoctorNotes.jsx";

const mockChild = {
  id: "CH1234567",
  name: "John Doe",
  healthRecords: [
    {
      record_type: "Doctor Note",
      record_date: "2026-03-18T12:00:00Z",
      title: "Checkup",
      doctor_name: "Dr. Smith",
      diagnosis: "Flu",
      treatment: "Rest",
      notes: "Patient is recovering well",
    },
    {
      record_type: "Prescription",
      record_date: "2026-03-17T12:00:00Z",
      medication_name: "Paracetamol",
      medication_dosage: "500mg",
      doctor_name: "Dr. Smith",
      notes: "Take after meals",
    },
  ],
};

beforeEach(() => {
  global.fetch = vi.fn((url, options) => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders ClinicalNotes with selected child and toggles modes", async () => {
  render(<ClinicalNotes selectedChild={mockChild} />);

  //header
  expect(screen.getByText(/Clinical Records/i)).toBeInTheDocument();
  expect(screen.getByText("John Doe")).toBeInTheDocument();

  //checking if doc notes is loaded
  expect(screen.getByText(/Add Doctor Note/i)).toBeInTheDocument();
  expect(screen.getByText(/Doctor Notes History/i)).toBeInTheDocument();

  //check initial record rendered
  expect(screen.getByText(/Checkup/i)).toBeInTheDocument();
  expect(screen.getByText(/Flu/i)).toBeInTheDocument();
  expect(screen.getByText(/Rest/i)).toBeInTheDocument();
  expect(screen.getByText(/Patient is recovering well/i)).toBeInTheDocument();

  //toggle to prescription tab
  fireEvent.click(screen.getByText(/Prescriptions/i));
  expect(screen.getByText(/Prescribe Medicine/i)).toBeInTheDocument();
  expect(screen.getByText(/Prescription History/i)).toBeInTheDocument();
  expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
});

test("submits a doctor note and updates history", async () => {
  render(<ClinicalNotes selectedChild={mockChild} />);

  //fill note form
  fireEvent.change(screen.getByPlaceholderText(/Follow-up visit/i), {
    target: { value: "Follow-up visit" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Dr. Sarah Mitchell/i), {
    target: { value: "Dr. Adams" },
  });
  fireEvent.change(
    screen.getByPlaceholderText(/Observations, follow-up instructions.../i),
    {
      target: { value: "New note content" },
    },
  );

  fireEvent.click(screen.getByText(/Save Note/i));

  await waitFor(() =>
    expect(screen.getByText(/✓ Note saved/i)).toBeInTheDocument(),
  );

  //check new note in history
  expect(screen.getByText(/Follow-up visit/i)).toBeInTheDocument();
  expect(screen.getByText(/Dr. Adams/i)).toBeInTheDocument();
  expect(screen.getByText(/New note content/i)).toBeInTheDocument();
});

test("submits a prescription and updates history", async () => {
  render(<ClinicalNotes selectedChild={mockChild} />);

  fireEvent.click(screen.getByText(/Prescriptions/i));

  //fill prescription form
  fireEvent.change(screen.getByPlaceholderText(/Amoxicillin/i), {
    target: { value: "Ibuprofen" },
  });
  fireEvent.change(screen.getByPlaceholderText(/250mg/i), {
    target: { value: "200mg" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Dr. Sarah Mitchell/i), {
    target: { value: "Dr. Lee" },
  });
  fireEvent.click(screen.getByText(/Save Prescription/i));

  await waitFor(() =>
    expect(screen.getByText(/✓ Prescription saved/i)).toBeInTheDocument(),
  );

  //check if new prescription in history section
  expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
  expect(screen.getByText(/200mg/i)).toBeInTheDocument();
  expect(screen.getByText(/Dr. Lee/i)).toBeInTheDocument();
});
