import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "../../contexts/auth";

const socket = io("http://localhost:5000");

const SessionAudio = () => {
  const [streamy, setStreamy] = useState();
  const [mySocketID, setMySocketID] = useState("");
  const [recievingCall, setRecievingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [UsersInRoom, setUsersInRoom] = useState(0);

  const myAudio = useRef();
  const otherAudio = useRef();

  let params = useParams();
  const sessionID = params.sessionId;

  const auth = useAuth();

  /*When page loads, have function for tutor to set up their audio (make them initiator), 
  then allow them to "start" the session, so student can join
  
  While tutor is starting session, put student in a waiting area,

  Should probably make separate component for waiting room
  */
  const tutorInitSession = () => {};

  useEffect(() => {
    socket.on("mySocketID", (id) => {
      setMySocketID(id);
    });

    socket.emit("joinroom", sessionID);

    socket.on("connectPeerz", (data) => {
      setRecievingCall(true);
      setCallerSignal(data.signal);
    });

    socket.on("getUsersInRoom", (data) => {
      setUsersInRoom(data);
      console.log(data);
    });
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

  const addMedia = (stream) => {
    setStreamy(stream);
    myAudio.current.srcObject = stream;
  };

  const connectPeers1 = () => {
    //initializing initiator peer
    const peer1 = new Peer({
      initiator: true,
      trickle: false,
      stream: streamy,
    });

    //The peer wants to send signaling data to the remote peer.
    //This event is fired immediately when the peer is initiator.
    peer1.on("signal", (data) => {
      console.log(data);
      socket.emit("connectPeers", {
        signalData: data,
        room: sessionID,
      });
    });

    socket.on("connectPeers2", (data) => {
      peer1.signal(data.signal);
    });

    peer1.on("stream", (stream) => {
      otherAudio.current.srcObject = stream;
    });
  };

  //THIS FUNCTION ACTS AS ANSWER CALL, CALL IT WHEN STUDENT IS BROUGHT INTO SESSION

  const connectPeers2 = () => {
    setCallAccepted(true);

    const peer2 = new Peer({
      initiator: false,
      trickle: false,
      stream: streamy,
    });

    peer2.on("signal", (data) => {
      socket.emit("connectPeers2", {
        signalData: data,
        room: sessionID,
      });
    });

    peer2.signal(callerSignal);

    peer2.on("stream", (stream) => {
      otherAudio.current.srcObject = stream;
    });
  };

  const endCall = () => {
    setCallEnded(true);
  };

  return (
    <div className="session-container">
      {/* SET "myAudio" AND "otherAudio" BY PASSING AUDIO DATA TO SESSION USING PROPS,
      THEN USE REFS THERE LIKE BELOW, ALL OTHER LOGIC CAN BE IN TUTORINIT AND STUDENTWAIT*/}
      <audio ref={myAudio} muted autoPlay></audio>
      <audio ref={otherAudio} autoPlay></audio>
      {/* <button onClick={acceptedAudio}>click</button>
      <audio ref={myAudio} muted autoPlay></audio>
      {!callEnded && <audio ref={otherAudio} autoPlay></audio>}
      <button onClick={connectPeers1}>Start Call</button>
      {recievingCall && !callAccepted ? (
        <div>
          <h1>Someone is in the audio channel</h1>
          <button onClick={connectPeers2}>Answer</button>
        </div>
      ) : null}
      {callAccepted && !callEnded ? (
        <button onClick={endCall}>End Call</button>
      ) : null} */}
    </div>
  );
};

export default SessionAudio;
