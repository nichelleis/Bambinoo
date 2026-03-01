export default function NurseAIAnalytics({ selectedChild }) {
  return (
    <div>
      <h1>AI Analytics</h1>
      {selectedChild ? (
        <p>Showing analytics for: {selectedChild.name}</p>
      ) : (
        <p>No child selected. Please search and select a child first.</p>
      )}
    </div>
  );
}