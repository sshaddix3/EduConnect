import React from "react";
import logo from "./logo.svg";
import { Link, Outlet } from "react-router-dom";

import "./App.css";
import "./styleSheet.css";
import SessionReqTable from "./components/SessionReqTable";

function App() {
  return (
    <div className="App">
      <p>InstantTutor - Tutor View</p>
      <SessionReqTable></SessionReqTable>
    </div>
  );
}

export default App;
