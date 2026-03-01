import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import RegistrationForm from "./pages/regestration";
import ParentLayout from "./layouts/ParentLayout";
import NurseLayout from "./layouts/NurseLayout";
import AdminLayout from "./layouts/AdminLayout";
import DoctorLayout from "./layouts/DoctorLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/doctor/*" element={<DoctorLayout />} />
      <Route path="/nurse/*" element={<NurseLayout />} />
      <Route path="/parent/*" element={<ParentLayout />} />
    </Routes>
  );
}

export default App;
