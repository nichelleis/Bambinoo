export default function NurseDashboard({ selectedChild }) {
  return (
    <div>
      <h1>Nurse Dashboard</h1>
      {selectedChild ? <p>Dashboard for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}