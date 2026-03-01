export default function NurseImmunizations({ selectedChild }) {
  return (
    <div>
      <h1>Immunizations</h1>
      {selectedChild ? <p>Immunizations for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}