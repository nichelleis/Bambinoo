export default function MessageNurse({ selectedChild }) {
  return (
    <div>
      <h1>Messaging</h1>
      {selectedChild ? <p>Messages for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}