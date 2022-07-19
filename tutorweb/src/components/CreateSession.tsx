import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Session from "./Session";
import SessionReqTable from "./SessionReqTable";
import { CreateSessionProps } from "./SessionReqTable";

const CreateSession = ({ userid, tabcapture, tutorid }: CreateSessionProps) => {
  const navigate = useNavigate();
  const navlink: string = "/session/";

  const startSession = () => {
    const requestBody = {
      tutorID: tutorid,
      userID: userid,
      screenshotSRC: tabcapture,
    };

    fetch("http://localhost:3000/activeSession", {
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
        navigate(navlink + parsedResponse.id, {});
      });
  };

  return (
    <div>
      <button onClick={startSession}>Start Session</button>
    </div>
  );
};

export default CreateSession;
