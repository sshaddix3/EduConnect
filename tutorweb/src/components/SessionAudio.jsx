import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000");

const SessionAudio = () => {
  const [streamy, setStreamy] = useState();
  const [mySocketID, setMySocketID] = useState("");
  const [recievingCall, setRecievingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [UsersInRoom, setUsersInRoom] = useState(0);
  const [someoneInAudio, setSomeoneInAudio] = useState(false);

  const myAudio = useRef();
  const otherAudio = useRef();
  const connectionRef = useRef();

  let params = useParams();
  const sessionID = params.sessionId;

  //   useEffect(() => {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: false, audio: true })
  //       .then((stream) => {
  //         setStream(stream);
  //         myAudio.current.srcObject = stream;
  //       });
  //   }, []);

  //   useEffect(() => {
  //     socket.on("mySocketID", (id) => {
  //       setMySocketID(id);
  //     });

  //     socket.on("callUser", (data) => {
  //       setRecievingCall(true);
  //       setCaller(data.from);
  //       setCallerSignal(data.signal);
  //     });

  //     socket.emit("joinroom", sessionID);
  //   }, []);

  //   const startCall = () => {
  //     const peer1 = new Peer({
  //       initiator: true,
  //       trickle: false,
  //       stream: stream,
  //     });

  //     peer1.on("signal", (data) => {
  //       socket.emit("callUser", {
  //         signalData: data,
  //         from: mySocketID,
  //         room: sessionID,
  //       });
  //     });

  //     peer1.on("stream", (stream) => {
  //       otherAudio.current.srcObject = stream;
  //     });

  //     socket.on("callAccepted", (signal) => {
  //       setCallAccepted(true);
  //       peer1.signal(signal);
  //     });

  //     connectionRef.current = peer1;
  //   };

  //   const answerCall = () => {
  //     setCallAccepted(true);
  //     const peer2 = new Peer({
  //       initiator: false,
  //       trickle: false,
  //       stream: stream,
  //     });

  //     peer2.on("signal", (data) => {
  //       socket.emit("answerCall", { signal: data, to: caller, room: sessionID });
  //     });

  //     peer2.on("stream", (stream) => {
  //       otherAudio.current.srcObject = stream;
  //     });

  //     peer2.signal(callerSignal);
  //     connectionRef.current = peer2;
  //   };

  //   const endCall = () => {
  //     setCallEnded(true);
  //     connectionRef.current.destroy();
  //   };

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
      <button onClick={acceptedAudio}>click</button>
      <audio ref={myAudio} muted autoPlay></audio>
      {!callEnded && <audio ref={otherAudio} autoPlay></audio>}
      <button onClick={connectPeers1}>Start</button>
      {recievingCall && !callAccepted ? (
        <div>
          <h1>Someone is in the audio channel</h1>
          <button onClick={connectPeers2}>Answer</button>
        </div>
      ) : null}
      {callAccepted && !callEnded ? (
        <button onClick={endCall}>End Call</button>
      ) : null}
      {/* <div>
        <div>{stream && <audio muted ref={myAudio} autoPlay />}</div>
        <div>
          {callAccepted && !callEnded ? (
            <audio ref={otherAudio} autoPlay />
          ) : null}
        </div>
        <div className="session-container">
          <div>My Id: {mySocketID}</div>
          <div>
            {callAccepted && !callEnded ? (
              <button onClick={endCall}>End Call</button>
            ) : (
              <button onClick={() => startCall()}>
                <div>Connect To Audio</div>
              </button>
            )}
          </div>
        </div>
        <div>
          {recievingCall && !callAccepted ? (
            <div>
              <h1>Someone is in the audio channel</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          ) : null}
        </div>
      </div> */}
    </div>
  );
};

export default SessionAudio;
