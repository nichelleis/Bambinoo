import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../doctor/pages/sidebar/Sidebar";
import Dashboard from "../doctor/pages/Dashboard/Dashboard";
import SearchChild from "../doctor/pages/searchchild/SearchChild";
import CHDRView from "../doctor/pages/CHDRView/CHDRView";
import Growth from"../doctor/pages/Growth/Growth";
import Immunizations from "../doctor/pages/Immunizations/Immunizations";
import MedicalHistory from "../doctor/pages/MedicalHistory/MedicalHistory";
import Medicines from "../doctor/pages/Medicines/Medicines";

function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

export default function App() {
  const [selectedChild, setSelectedChild] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/search"
            element={
              <SearchChild
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
              />
            }
          />

          <Route
            path="/chdr"
            element={<CHDRView selectedChild={selectedChild} />}
          />

          <Route
          path="/growth"
          element={<Growth selectedChild={selectedChild} />}
          />
          <Route
          path="/immunizations"
          element={<Immunizations selectedChild={selectedChild} />}
          />

          <Route
          path="/medicalhistory"
          element={<MedicalHistory selectedChild={selectedChild} />}
          />
          <Route path="/development" element={<Placeholder title="Development" />} />
          <Route
          path="/medicines"
          element={<Medicines selectedChild={selectedChild} />}
          />
          <Route path="/doctor-notes" element={<Placeholder title="Doctor Notes" />} />
          <Route path="/messaging" element={<Placeholder title="Messaging" />} />
          <Route path="/ai-analytics" element={<Placeholder title="AI Analytics" />} />
          <Route path="/auth" element={<Placeholder title="User Auth" />} />
        </Routes>
      </main>
    </div>
  );
}
