import { Routes, Route } from "react-router-dom";

import DashboardHeader from "../parent/Components/DashBoardHeader";
import SideNav from "../parent/Components/DashboardNav";

import Home from "../parent/Pages/home/home";
import Analytics from "../parent/Pages/Analytics/Analytics";
import AIAnalytics from "../parent/Pages/AIAnalytics/AIAnalytics";
import Milestones from "../parent/Pages/MileStones/MileStones";
import MessageDoctor from "../parent/Pages/MessageDoctor/MessageDoctor";
import Education from "../parent/Pages/Education/Education";
import Profile from "../parent/Pages/Profile/Profile";
import ReportRequest from "../parent/Pages/ReportRequest/ReportRequest";

function ParentLayout() {
  return (
    <>
      <DashboardHeader />

      <div className="d-flex">
        <SideNav />

        <main className="flex-grow-1 p-4 ms-5 main-body">
          <Routes>
            <Route index element={<Home />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="ai-analytics" element={<AIAnalytics />} />
            <Route path="education" element={<Education />} />
            <Route path="message-doctor" element={<MessageDoctor />} />
            <Route path="profile" element={<Profile />} />
            <Route path="report-request" element={<ReportRequest />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default ParentLayout;
