export default function GrowthNurse({ selectedChild }) {
  return (
    <div>
      <h1>Growth Data</h1>
      {selectedChild ? <p>Growth data for: {selectedChild.name}</p> : <p>No child selected.</p>}
    </div>
  );
}