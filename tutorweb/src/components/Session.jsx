import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import SessionAudio from "./SessionAudio";
import Whiteboard from "./Whiteboard";
import { useAuth } from "../contexts/auth";
import { ProtectedRoute } from "./ProtectedRoute";

const SessionContent = () => {
  let params = useParams();
  const sessionID = params.sessionId;

  const location = useLocation();
  // console.log(location.state.tutorID + " " + location.state.studentID);

  // const auth = useAuth();

  // useEffect(() => {
  //   auth.setAuth({ id: 2, name: "test" });
  // }, []);

  // // auth.setAuth({ id: 2, name: "test" });
  // console.log(auth);

  return (
    <div className="session-container">
      <h1>Session: {sessionID}</h1>

      {/* <Whiteboard></Whiteboard> */}
      <SessionAudio></SessionAudio>
    </div>
  );
};

const Session = () => {
  return (
    <ProtectedRoute>
      <SessionContent></SessionContent>
    </ProtectedRoute>
  );
};

export default Session;
