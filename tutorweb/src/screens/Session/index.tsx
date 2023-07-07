import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Peer, { Instance } from "simple-peer";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";

import SessionAudio from "./SessionAudio";
import Whiteboard from "./Whiteboard";
import RefurbWb from "./RefurbWb";
import { useAuth } from "../../contexts/auth";
import { ProtectedRoute } from "../../shared/ProtectedRoute";
import { StudentWaitingRoom } from "./StudentWaitingRoom";
import { TutorInitSession } from "./TutorInitSession";

const socket = io("http://localhost:5000");

export interface TutorInitSessionProps {
  onRequestSessionStarted: (value: IUserInfo) => void;
}

export interface StudentWaitingRoomProps {
  onRequestSessionStarted: (value: IUserInfo) => void;
}

interface IUserInfo {
  peer: Instance;
}

export interface IWhiteboard {
  socket: Socket;
  sessionId: string | undefined;
  role: string;
}

const SessionContent = () => {
  const [mySocketID, setMySocketID] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [tutorInfo, setTutorInfo] = useState<IUserInfo>();
  const [studentInfo, setStudentInfo] = useState<IUserInfo>();
  const [amIMuted, setAmIMuted] = useState(false);

  const isMountedTut = useRef(false);
  const isMountedStu = useRef(false);

  let params = useParams();
  const sessionID = params.sessionId;
  const auth: any = useAuth();

  let tutorPeer = useRef<Instance | undefined>(undefined);
  let studentPeer = useRef<Instance | undefined>(undefined);

  const tutorAudio: any = useRef();
  const studentAudio: any = useRef();

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  console.log("rendering SessionContent");

  //STUDENT JOINS SESSION MUTED

  // useEffect(() => {
  //   fetch("http://localhost:3000/auth", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   })
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((parsedResponse) => {
  //       auth.setAuth(parsedResponse.authUser);
  //       console.log(parsedResponse);
  //     });
  // }, []);

  useEffect(() => {
    socket.on("mySocketID", (id) => {
      setMySocketID(id);
    });
    socket.emit("joinroom", sessionID);

    socket.on("muteME", (data) => {
      console.log(`${data.from} ---- ${auth.authUser.role}`);
      if (data.from === "student" && auth.authUser.role === "tutor") {
        if (studentAudio.current.muted) {
          studentAudio.current.muted = false;
          console.log("UNmuting student");
        } else {
          studentAudio.current.muted = true;
          console.log("muting student");
        }
      }
      if (data.from === "tutor" && auth.authUser.role === "student") {
        if (tutorAudio.current.muted) {
          tutorAudio.current.muted = false;
          console.log("UNmuting tutor");
        } else {
          tutorAudio.current.muted = true;
          console.log("muting tutor");
        }
      }
    });
  }, []);

  const onSessionStartRequest = (userInfo: IUserInfo) => {
    setSessionStarted(true);
    if (auth.authUser.role === "tutor") {
      tutorPeer.current = userInfo?.peer;
      console.log(tutorPeer.current);
      connectTutorPeer();
    } else {
      studentPeer.current = userInfo?.peer;
      console.log(studentPeer.current);
      connectStudentPeer();
    }
  };

  const connectTutorPeer = () => {
    console.log("connectTutorPeer");
    if (tutorPeer.current) {
      tutorPeer.current.on("signal", (data) => {
        socket.emit("initiatorSignaling", {
          signalData: data,
          room: sessionID,
        });
      });

      socket.on("studentSignal", (data) => {
        tutorPeer.current?.signal(data.signal);
      });

      tutorPeer.current.on("connect", () => {
        console.log("connected");
      });

      tutorPeer.current.on("stream", (stream) => {
        console.log(stream);
        studentAudio.current.srcObject = stream;
      });
    }
  };

  const connectStudentPeer = () => {
    console.log("connectStudentPeer");
    if (studentPeer.current) {
      studentPeer.current.on("signal", (data) => {
        socket.emit("nonInitiatorSignaling", {
          signalData: data,
          room: sessionID,
        });
      });

      socket.on("tutorSignal", (data) => {
        studentPeer.current?.signal(data.signal);
      });

      studentPeer.current.on("connect", () => {
        console.log("connected");
      });

      studentPeer.current.on("stream", (stream) => {
        console.log(stream);

        //Uncaught TypeError: Cannot set properties of undefined (setting 'srcObject')
        //WHY IS THIS NOT WORKING?
        tutorAudio.current.srcObject = stream;
      });
    }
  };

  const muteMe = () => {
    socket.emit("muteMe", { role: auth.authUser.role, room: sessionID });

    if (amIMuted) {
      setAmIMuted(false);
    } else {
      setAmIMuted(true);
    }
  };

  return (
    <div>
      {/* {auth.authUser.role === "student" && !sessionStarted ? (
        <StudentWaitingRoom
          onRequestSessionStarted={onSessionStartRequest}
        ></StudentWaitingRoom>
      ) : null}
      {auth.authUser.role === "tutor" && !sessionStarted ? (
        <TutorInitSession
          onRequestSessionStarted={onSessionStartRequest}
        ></TutorInitSession>
      ) : null}
      {sessionStarted && (
        <div className="session-container">
          <div>Session Started</div>
          {auth.authUser.role === "tutor" && (
            <div>
              <div>Playing student audio</div>
              <audio ref={studentAudio} autoPlay></audio>
            </div>
          )}
          {auth.authUser.role === "student" && (
            <div>
              <div>Playing tutor audio</div>
              <audio ref={tutorAudio} autoPlay></audio>
            </div>
          )}
          <button onClick={muteMe} className="mute-button">
            {amIMuted ? (
              <FontAwesomeIcon
                icon={faMicrophoneSlash as IconProp}
                size="3x"
                className="microphone-slash-icon"
              />
            ) : (
              <FontAwesomeIcon
                icon={faMicrophone as IconProp}
                size="3x"
                className="microphone-icon"
              />
            )}
          </button>
        </div>
      )} */}
      {/* <Whiteboard></Whiteboard> */}
      <RefurbWb
        socket={socket}
        sessionId={sessionID}
        role={auth.authUser.role}
      ></RefurbWb>
      {/* <SessionAudio></SessionAudio> */}
    </div>
  );
};

export const Session = () => {
  return (
    <ProtectedRoute>
      <SessionContent></SessionContent>
    </ProtectedRoute>
  );
};

// useEffect(() => {
//   if (isMountedTut.current) {
//     tutorPeer.current = tutorInfo?.peer;
//     console.log(tutorPeer.current);

//     if (auth.authUser.role === "tutor") {
//       connectTutorPeer();
//     }
//   } else {
//     isMountedTut.current = true;
//   }
// }, [tutorInfo]);

// useEffect(() => {
//   if (isMountedStu.current) {
//     studentPeer.current = studentInfo?.peer;
//     console.log(studentPeer.current);

//     if (auth.authUser.role === "student") {
//       connectStudentPeer();
//     }
//   } else {
//     isMountedStu.current = true;
//   }
// }, [studentInfo]);
