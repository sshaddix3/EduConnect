import React from "react";
import logo from "./logo.svg";
import { Link, Outlet } from "react-router-dom";

import { AuthProvider } from "./contexts/auth";
import "./App.css";
import "./styleSheet.css";
import SessionReqTable from "./components/SessionReqTable";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <ProtectedRoute>
      <div className="App">
        <p>InstantTutor - Tutor View</p>
        <SessionReqTable></SessionReqTable>
      </div>
    </ProtectedRoute>
  );
}

export default App;
