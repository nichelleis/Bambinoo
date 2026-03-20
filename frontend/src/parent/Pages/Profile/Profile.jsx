import React, { useEffect, useState } from "react";
import style from "../../../assets/styleSheets/ParentDashboard.module.css";

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}y ${months}m`;
}

function getInitials(name) {
  if (!name) return "";

  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0][0].toUpperCase();
  }

  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
  return firstInitial + lastInitial;
}

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, []);

  if (!profile) return <div>Loading...</div>;

  const { child, birth, background, parent } = profile;

  return (
    <div className="container-fluid">
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(37, 165, 185, 0.15) 0%, rgba(252, 99, 255, 0.06) 100%)",
          border: "1px solid rgba(22,163,110,0.2)",
          borderRadius: 20,
          padding: "28px 28px",
          marginBottom: 20,
          display: "flex",
          gap: 28,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 4px 24px rgba(22,163,110,0.07)",
        }}
      >
        <div className="d-flex align-items-center gap-4">
          <div
            className={style.profileAvatar}
            style={{
              background:
                child.gender?.toLowerCase() === "male"
                  ? "#4A90E2"
                  : "#f576b5ff",
            }}
          >
            {getInitials(child.name)}
          </div>

          <div>
            <h2
              className="mb-1"
              style={{ fontFamily: "Nonito", fontWeight: "500" }}
            >
              {child.name}
            </h2>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span
                style={{
                  color: "rgb(122, 121, 121)",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                <i className="bi bi-calendar me-1"></i>
                {new Date(child.dob).toLocaleDateString()}
              </span>

              <span className={style.badgeLight}>
                {calculateAge(child.dob)}
              </span>
              <span className={style.badgeLight}>{child.gender}</span>
            </div>

            <div className={`mt-2  ${style.refNumber}`}>
              Reg. {child.reg_number}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-md-6">
          <div className={style.dashboardCard}>
            <div
              style={{
                fontWeight: "bolder",
                marginBottom: 12,
              }}
            >
              <i className={`bi bi-activity ${style.biProfile}`}></i> Birth
              Measurements
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Weight</span>
              <span className={style.infoDetails}>{birth.weight} kg</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Length</span>
              <span className={style.infoDetails}>{birth.length} cm</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Head Circumference</span>
              <span className={style.infoDetails}>{birth.head} cm</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className={style.dashboardCard}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <i className={`bi bi-geo-alt ${style.biProfile}`}></i> Background
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Nationality</span>
              <span className={style.infoDetails}>
                {background.nationality}
              </span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Language</span>
              <span className={style.infoDetails}>{background.language}</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className={style.dashboardCard}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <i className={`bi bi-heart ${style.biProfile}`}></i> Birth Details
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Hospital</span>
              <span className={style.infoDetails}>{birth.hospital}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Location</span>
              <span className={style.infoDetails}>{birth.location}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Delivery</span>
              <span className={style.infoDetails}>{birth.delivery}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Surgery</span>
              <span className={style.infoDetails}>{birth.surgery}</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className={style.dashboardCard}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <i className={`bi bi-person ${style.biProfile}`}></i> Parent /
              Guardian
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Name</span>
              <span className={style.infoDetails}> {parent.name}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Email</span>
              <span className={style.infoDetails}> {parent.email}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Phone</span>
              <span className={style.infoDetails}> {parent.phone}</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Address</span>
              <span className={style.infoDetails}>{parent.Address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
