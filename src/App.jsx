import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherLayout from "./components/TeacherLayout";
import ParentDashboard from "./components/ParentDashboard";
import AdmissionForm from "./components/AdmissionForm";
import ApplicationStatus from "./components/ApplicationStatus";
import MarkEntry from "./components/MarkEntry";
import AttendanceSystem from "./components/AttendanceSystem";
import StudentRemarks from "./components/StudentRemarks";
import TeacherChat from "./components/TeacherChat";
import TeacherSettings from "./components/TeacherSettings";

import LandingLayout from "./components/landing/LandingLayout";
import HomePage from "./pages/landing/HomePage";
import AboutPage from "./pages/landing/AboutPage";
import AcademicsPage from "./pages/landing/AcademicsPage";
import AdmissionsPage from "./pages/landing/AdmissionsPage";
import ContactPage from "./pages/landing/ContactPage";
import AnnouncementsPage from "./pages/landing/AnnouncementsPage";

const RootRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (role === "admin") return <Navigate to="/services/portal/admin" />;
  if (role === "teacher") return <Navigate to="/services/portal/teacher" />;
  if (role === "parent") return <Navigate to="/services/portal/parent" />;

  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Pages */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<AdmissionForm />} />
          <Route path="/application-status/:email" element={<ApplicationStatus />} />

          {/* Protected Portal Routes */}
          <Route path="/services" element={<RootRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/services/portal/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/services/portal/teacher" element={<TeacherDashboard />} />
              <Route path="/services/portal/teacher/marks" element={<MarkEntry />} />
              <Route path="/services/portal/teacher/attendance" element={<AttendanceSystem />} />
              <Route path="/services/portal/teacher/remarks-entry" element={<StudentRemarks />} />
              <Route path="/services/portal/teacher/chat" element={<TeacherChat />} />
              <Route path="/services/portal/teacher/settings" element={<TeacherSettings />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
            <Route path="/services/portal/parent" element={<ParentDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
