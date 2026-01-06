import "./DoctorGreeting.css";

const DoctorGreeting = ({ doctorName = "Dr. Lana Smith" }) => {
  const hour = new Date().getHours();

  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  if (hour >= 17) greeting = "Good Evening";

  return (
    <div className="doctor-greeting">
      <h2>Hi, {doctorName}</h2>
      <p>Here's what's happening with your patients today.</p>
    </div>
  );
};

export default DoctorGreeting;