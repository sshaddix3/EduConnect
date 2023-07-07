import React from "react";

import "./styleSheet.css";
import { ProtectedRoute } from "../shared/ProtectedRoute";
import { useAuth } from "../contexts/auth";

export function StudentDashboard() {
  const auth = useAuth();

  return (
    <ProtectedRoute>
      <div className="App">
        <p>InstantTutor - Student View</p>
        <div id="dashboard-greeting">
          Hi {auth.authUser?.firstname} - {auth.authUser?.role}
        </div>
        <div>Download the Chrome Extension</div>
      </div>
    </ProtectedRoute>
  );
}
