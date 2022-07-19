import React from "react";

import "./App.css";
import "./styleSheet.css";
import SessionReqTable from "./SessionReqTable";
import { ProtectedRoute } from "../../shared/ProtectedRoute";

export function TutorDashboard() {
  return (
    <ProtectedRoute>
      <div className="App">
        <p>InstantTutor - Tutor View</p>
        <SessionReqTable></SessionReqTable>
      </div>
    </ProtectedRoute>
  );
}
