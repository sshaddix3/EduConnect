import React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const StartSession = () => {
  const navigate = useNavigate();
  const navlink: string = "/session/";

  const location: any = useLocation();
  // console.log(location.state.tutorID + " " + location.state.studentID);

  const [sessionStarted, setSessionStarted] = useState(false);

  const requestBody = {
    sessionID: location.state.sessionID,
    tutorID: location.state.tutorID,
    studentID: location.state.studentID,
    startSession: true,
  };

  const startSession = () => {
    fetch("http://localhost:3000/startSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        return res.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
      });

    setSessionStarted(true);
    navigate(navlink + location.state.sessionID);
  };

  return (
    <div>
      <button onClick={startSession}>Start Session</button>
    </div>
  );
};

export default StartSession;
