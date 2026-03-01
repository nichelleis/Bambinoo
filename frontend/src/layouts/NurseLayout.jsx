export default function NurseLayout() {
  return (
    <div>
      <h2>Nurse Dashboard</h2>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}
