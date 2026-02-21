import React from "react";

function Profile({ profile }) {
  return (
    <div className="container-fluid">
      <div className="profileHeaderCard">
        <div className="d-flex align-items-center gap-4">
          <div className="profileAvatar">TF</div>

          <div>
            <h2 className="mb-1">Thinal Fernando</h2>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badgeLight">
                <i className="bi bi-calendar me-1"></i>
                15 Jun 2024
              </span>

              <span className="badgeLight">21</span>
              <span className="badgeLight">Male</span>
            </div>

            <div className="mt-2 text-muted">Reg. CHDR-2024-00312</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-md-6">
          <div className="profileCard">
            <div className="cardTitle">
              <i className="bi bi-heart"></i> Birth Details
            </div>

            <div className="infoRow">
              <span>Hospital</span>
              <span>National Hospital</span>
            </div>

            <div className="infoRow">
              <span>Location</span>
              <span>Colombo</span>
            </div>

            <div className="infoRow">
              <span>Delivery</span>
              <span>Natural</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="profileCard">
            <div className="cardTitle">
              <i className="bi bi-activity"></i> Birth Measurements
            </div>

            <div className="infoRow">
              <span>Weight</span>
              <span>12</span>
            </div>

            <div className="infoRow">
              <span>Length</span>
              <span>23</span>
            </div>

            <div className="infoRow">
              <span>Head Circ.</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="profileCard">
            <div className="cardTitle">
              <i className="bi bi-geo-alt"></i> Background
            </div>

            <div className="infoRow">
              <span>Nationality</span>
              <span>Sri lankan</span>
            </div>

            <div className="infoRow">
              <span>Language</span>
              <span>Sinhala</span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="profileCard">
            <div className="cardTitle">
              <i className="bi bi-person"></i> Parent / Guardian
            </div>

            <div className="infoRow">
              <span>Name</span>
              <span>Thinal Fernando 2</span>
            </div>

            <div className="infoRow">
              <span>Email</span>
              <span>thinal@test.123</span>
            </div>

            <div className="infoRow">
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
