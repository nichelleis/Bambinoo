export default function CHDRViewNurse({ selectedChild }) {
  return (
    <div>
      <h1>CHDR View</h1>
      {selectedChild ? <p>Viewing CHDR for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}