export default function NurseNotes({ selectedChild }) {
  return (
    <div>
      <h1>Nurse Notes</h1>
      {selectedChild ? <p>Notes for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}