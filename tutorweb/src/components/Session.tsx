import React from "react";
import { useParams } from "react-router-dom";

const Session = () => {
  let params = useParams();
  return (
    <div>
      <h1>Session: {params.sessionId}</h1>
    </div>
  );
};

export default Session;
