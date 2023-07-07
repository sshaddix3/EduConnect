import { parse } from "path";
import React, { useState, useEffect } from "react";
import { useUpdate } from "react-use";
import { useMount } from "react-use";
import CreateSession from "./CreateSession";

function SessionReqTable() {
  const getSessionRequests = () => {
    fetch("http://localhost:3000/getSessionRequests", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((parsedResponse) => {
        for (
          let i: number = 0;
          i < parsedResponse.sessionRequests.length;
          i++
        ) {
          sessionReqArr.push(parsedResponse.sessionRequests[i]);
        }
        setSessionRequests(parsedResponse.sessionRequests);
      });
  };

  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  useMount(getSessionRequests);

  let sessionReqArr: SessionRequest[] = [];

  type SessionRequest = {
    id: number;
    userid: number;
    tabcaptureimg: string;
  };

  return (
    <div>
      {sessionRequests.length > 0 && (
        <div className="sessionrequest-table-container">
          {sessionRequests.map((request: SessionRequest) => (
            <div key={request.id} className="sessionrequest-row-container">
              <div>
                {request.id} - {request.userid}
              </div>
              <img src={request.tabcaptureimg} width="400" height="250"></img>
              <CreateSession
                tutorid={6789}
                userid={request.userid}
                tabcapture={request.tabcaptureimg}
              ></CreateSession>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface CreateSessionProps {
  tutorid: number;
  userid: number;
  tabcapture: string;
}

export default SessionReqTable;
