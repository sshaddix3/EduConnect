import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SessionAudio from "./SessionAudio";
import Whiteboard from "./Whiteboard";

const Session = () => {
  let params = useParams();
  const sessionID = params.sessionId;

  return (
    <div className="session-container">
      <h1>Session: {sessionID}</h1>
      <Whiteboard></Whiteboard>
      {/* <SessionAudio></SessionAudio> */}
    </div>
  );
};

export default Session;
