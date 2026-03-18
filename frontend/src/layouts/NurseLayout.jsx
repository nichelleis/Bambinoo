import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import NurseSideNav from "../nurse/components/NurseSideNav";
import NurseDashboard from "../nurse/pages/NurseDashboard/NurseDashboard";
import NurseSearchChild from "../nurse/pages/NurseSearchChild/NurseSearchChild";
import NurseCHDRView from "../nurse/pages/NurseCHDRView/NurseCHDRView";
import NurseGrowth from "../nurse/pages/NurseGrowth/NurseGrowth";
import NurseImmunizations from "../nurse/pages/NurseImmunizations/NurseImmunizations";
import NurseAIAnalytics from "../nurse/pages/NurseAIAnalytics/NurseAIAnalytics";
import NurseDoctorProfile from "../nurse/pages/NurseProfile/NurseProfile";
import "../assets/styleSheets/NurseLayout.css";
import NurseMessages from "../nurse/pages/NurseMessages/NurseMessages";
import NurseUserAuthentication from "../nurse/pages/NurseUserAuthentication/NurseUserAuthentication";

function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

export default function NurseLayout() {
  const [selectedChild, setSelectedChild] = useState(null);

  return (
    <div className="app-layout">
      <NurseSideNav />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<NurseDashboard />} />
          <Route path="dashboard" element={<NurseDashboard />} />

          <Route
            path="search"
            element={<NurseSearchChild onSelect={setSelectedChild} />}
          />

          <Route
            path="chdr"
            element={<NurseCHDRView selectedChild={selectedChild} />}
          />

          <Route
            path="growth"
            element={<NurseGrowth selectedChild={selectedChild} />}
          />

          <Route
            path="immunizations"
            element={<NurseImmunizations selectedChild={selectedChild} />}
          />

          <Route path="messaging" element={<NurseMessages />} />

          <Route
            path="ai-analytics"
            element={<NurseAIAnalytics selectedChild={selectedChild} />}
          />

          <Route path="auth" element={<NurseUserAuthentication />} />

          <Route
            path="profile"
            element={<NurseDoctorProfile selectedChild={selectedChild} />}
          />
        </Routes>
      </main>
    </div>
  );
}
