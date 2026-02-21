import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import DoctorSideNav from "../doctor/components/DoctorSideNav";
import Dashboard from "../doctor/pages/Dashboard/Dashboard";
import SearchChild from "../doctor/pages/searchchild/SearchChild";
import CHDRView from "../doctor/pages/CHDRView/CHDRView";
import Growth from "../doctor/pages/Growth/Growth";
import Immunizations from "../doctor/pages/Immunizations/Immunizations";

import Medicines from "../doctor/pages/Medicines/Medicines";
import DoctorNotes from "../doctor/pages/DoctorNotes/DoctorNotes";
import Messages from "../doctor/pages/Messages/Messages";
import AIAnalytics from "../doctor/pages/AIAnalytics/AIAnalytics";
import "../doctor/components/DoctorLayout.css";

function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

export default function DoctorLayout() {
  const [selectedChild, setSelectedChild] = useState(null);

  return (
    <div className="app-layout">
      <DoctorSideNav />

      <main className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

      
          <Route
            path="search"
            element={<SearchChild onSelect={setSelectedChild} />}
          />

          <Route
            path="chdr"
            element={<CHDRView selectedChild={selectedChild} />}
          />

          <Route
            path="growth"
            element={<Growth selectedChild={selectedChild} />}
          />

          <Route
            path="immunizations"
            element={<Immunizations selectedChild={selectedChild} />}
          />

          

          <Route
            path="medicines"
            element={<Medicines selectedChild={selectedChild} />}
          />
          <Route
            path=" doctor-notes"
            element={<DoctorNotes selectedChild={selectedChild} />}
          />
          <Route
            path="messaging"
            element={<Messages selectedChild={selectedChild} />}
          />

          <Route
            path="ai-analytics"
            element={<AIAnalytics selectedChild={selectedChild} />}
          />
          <Route path="auth" element={<Placeholder title="User Auth" />} />
        </Routes>
      </main>
    </div>
  );
}
