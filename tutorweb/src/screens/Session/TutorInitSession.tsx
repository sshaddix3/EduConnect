import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer, { Instance } from "simple-peer";

import { TutorInitSessionProps } from ".";

const socket = io("http://localhost:5000");

export const TutorInitSession = ({
  onRequestSessionStarted,
}: TutorInitSessionProps) => {
  let params = useParams();
  const sessionID = params.sessionId;

  let tutorStuff: any = useRef({
    peer: null,
  });

  const acceptedAudio = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then(addMedia)
      .catch(() => {});
  };

  const addMedia = async (stream: any) => {
    console.log(stream);
    const peer1 = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    await setPeer(peer1);
    startSession();
  };

  const setPeer = (peer: Instance) => {
    return new Promise<void>((resolve) => {
      tutorStuff.current.peer = peer;
      resolve();
    });
  };

  const startSession = () => {
    const requestBody = {
      isSessionStarted: true,
      sessionID: sessionID,
    };

    fetch("http://localhost:3000/setSessionStarted", {
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
        onRequestSessionStarted(tutorStuff.current);
      });
  };

  return (
    <div>
      <button onClick={acceptedAudio}>Connect To Audio</button>
      {/* <button onClick={startSession}>Start Session</button> */}
    </div>
  );
};
