import React from "react";

import "./App.css";
import "./styleSheet.css";
import SessionReqTable from "./SessionReqTable";
import { ProtectedRoute } from "../../shared/ProtectedRoute";
import { useAuth } from "../../contexts/auth";

export function TutorDashboard() {
  const auth = useAuth();

  return (
    <ProtectedRoute>
      <div className="App">
        <p>InstantTutor - Tutor View</p>
        <div id="dashboard-greeting">
          Hi {auth.authUser?.firstname} - {auth.authUser?.role}
        </div>
        <SessionReqTable></SessionReqTable>
      </div>
    </ProtectedRoute>
  );
}
