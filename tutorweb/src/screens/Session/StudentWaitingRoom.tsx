import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer, { Instance } from "simple-peer";

import { StudentWaitingRoomProps } from ".";

const socket = io("http://localhost:5000");

export const StudentWaitingRoom = ({
  onRequestSessionStarted,
}: StudentWaitingRoomProps) => {
  const isMounted = useRef(false);
  const [studentPeer, setStudentPeer] = useState<Instance>();

  let params = useParams();
  const sessionID = params.sessionId;

  let studentStuff: any = useRef({
    peer: null,
  });

  useEffect(() => {
    acceptedAudio();
  }, []);

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
    const peer2 = new Peer({
      trickle: false,
      stream: stream,
    });

    await setPeer(peer2);
    // console.log(sessionID);
    checkIfSessionStarted();
  };

  const setPeer = (peer: Instance) => {
    return new Promise<void>((resolve) => {
      studentStuff.current.peer = peer;
      resolve();
    });
  };

  //Set sessionstarted in DB to true once tutor starts session,
  //After student connects to Audio, look in DB for when session started
  //once session is started, then run sendData();

  // useEffect(() => {
  //   if (isMounted.current) {
  //     sendData();
  //   } else {
  //     isMounted.current = true;
  //   }
  // }, [studentPeer]);

  function checkIfSessionStarted() {
    const requestBody = {
      sessionID: sessionID,
    };

    let timer = setTimeout(checkIfSessionStarted, 1000);

    fetch("http://localhost:3000/checkSessionStarted", {
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
        if (parsedResponse.sessionstarted) {
          clearTimeout(timer);
          console.log("session started");
          onRequestSessionStarted(studentStuff.current);
        }
      });
  }

  const sendData = () => {
    console.log(studentStuff);
  };

  return (
    <div>
      <div>Student Waiting Room</div>
      {/* <button onClick={acceptedAudio}>Connect To Audio</button> */}
      {/* <button onClick={sendData}>Send Data</button> */}
    </div>
  );
};
