import React from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function Profile() {
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
          <div className={style.profileAvatar}>TF</div>

          <div>
            <h2 className="mb-1" style={{fontFamily: "Nonito", fontWeight: "500"}}>Thinal Fernando</h2>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span  style={{color: "rgb(122, 121, 121)", fontSize: "14px", fontWeight: "bold"}}>
                <i className="bi bi-calendar me-1"></i>
                15 Jun 2024
              </span>

              <span className={style.badgeLight}>21 years </span>
              <span className={style.badgeLight}>Male</span>
            </div>

            <div className={`mt-2  ${style.refNumber}`}>
              Reg. CHDR-2024-00312
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
              <span className={style.infoDetails}>12</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Length</span>
              <span className={style.infoDetails}>23</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Head Circumference</span>
              <span className={style.infoDetails}>50</span>
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
              <span className={style.infoDetails}>Sri Lankan</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Language</span>
              <span className={style.infoDetails}>Sinhala</span>
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
              <span className={style.infoDetails}>National Hospital</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Location</span>
              <span className={style.infoDetails}>Colombo</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Delivery</span>
              <span className={style.infoDetails}>Natural</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Surgery</span>
              <span className={style.infoDetails}>No</span>
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
              <span className={style.infoDetails}>Thinal Fernando 2</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Email</span>
              <span className={style.infoDetails}>thinal@test.123</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Phone</span>
              <span className={style.infoDetails}>305984295</span>
            </div>

            <div className={style.infoRow}>
              <span className={style.infoMain}>Address</span>
              <span className={style.infoDetails}>
                45/B, Lotus Lane, Rajagiriya, Colombo 10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
