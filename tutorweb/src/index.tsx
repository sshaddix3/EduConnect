import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SessionReqTable from "./components/SessionReqTable";
import Session from "./components/Session";
import AwaitingSession from "./components/AwaitingSession";
import StartSession from "./components/StartSession";
import { Login } from "./components/Login";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { AuthCheck } from "./components/AuthCheck";
import { AuthProvider } from "./contexts/auth";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <AuthProvider>
    <AuthCheck>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/session/:sessionId" element={<Session />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthCheck>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
