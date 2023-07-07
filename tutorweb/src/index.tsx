import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { App } from "./App";
import { Session } from "./screens/Session";
import { Login } from "./screens/Login";
import { StudentLogin } from "./screens/Login/StudentLogin";
import { TutorLogin } from "./screens/Login/TutorLogin";
import { TutorDashboard } from "./screens/TutorDashboard";
import { StudentDashboard } from "./StudentDashboard";

import reportWebVitals from "./reportWebVitals";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <App>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TutorDashboard />} />
        <Route path="/session/:sessionId" element={<Session />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studentlogin" element={<StudentLogin />} />
        <Route path="/tutorlogin" element={<TutorLogin />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  </App>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
