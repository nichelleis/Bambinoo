import React from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function Profile() {
  return (
    <div className="container-fluid">
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(22,163,110,0.08) 0%, rgba(99,148,255,0.06) 100%)",
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
            <h2 className="mb-1">Thinal Fernando</h2>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span>
                <i className="bi bi-calendar me-1"></i>
                15 Jun 2024
              </span>

              <span className={style.badgeLight}>21 years </span>
              <span className={style.badgeLight}>Male</span>
            </div>

            <div className="mt-2 text-muted">Reg. CHDR-2024-00312</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-md-6">
          <div className={style.dashboardCard}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <i className="bi bi-heart"></i> Birth Details
            </div>

            <div className={style.infoRow}>
              <span>Hospital</span>
              <span>National Hospital</span>
            </div>

            <div className={style.infoRow}>
              <span>Location</span>
              <span>Colombo</span>
            </div>

            <div className={style.infoRow}>
              <span>Delivery</span>
              <span>Natural</span>
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
              <i className="bi bi-activity"></i> Birth Measurements
            </div>

            <div className={style.infoRow}>
              <span>Weight</span>
              <span>12</span>
            </div>

            <div className={style.infoRow}>
              <span>Length</span>
              <span>23</span>
            </div>

            <div className={style.infoRow}>
              <span>Head Circ.</span>
              <span>50</span>
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
              <i className="bi bi-geo-alt"></i> Background
            </div>

            <div className={style.infoRow}>
              <span>Nationality</span>
              <span>Sri Lankan</span>
            </div>

            <div className={style.infoRow}>
              <span>Language</span>
              <span>Sinhala</span>
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
              <i className="bi bi-person"></i> Parent / Guardian
            </div>

            <div className={style.infoRow}>
              <span>Name</span>
              <span>Thinal Fernando 2</span>
            </div>

            <div className={style.infoRow}>
              <span>Email</span>
              <span>thinal@test.123</span>
            </div>

            <div className={style.infoRow}>
              <span>Phone</span>
              <span>305984295</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
