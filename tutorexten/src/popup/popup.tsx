import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

declare const google: any;

function Popup() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [lookingForTutor, setLookingForTutor] = useState(null);

  function sendSessionRequestCommand(): void {
    chrome.runtime.sendMessage({ command: "sessionreq" }, function (response) {
      if (response.status === "ok") {
        setLookingForTutor(<div>Looking for Tutor</div>);
      } else if (response.status === "foundTutor") {
        setLookingForTutor(<div>Found Tutor</div>);
      } else if (response.status === "error") {
      }
    });
  }

  function sendLogInCommand(): void {
    chrome.runtime.sendMessage({ command: "login" }, function (response) {
      console.log(response);
      if (response.status === "loggedin") {
        setLoggedIn(true);
      }
    });
  }

  function logOut() {
    setLoggedIn(false);
    chrome.cookies.remove({ url: "http://localhost:3001", name: "userID" });
  }

  useEffect(() => {
    //DO I EVEN NEED TO ACCESS USER IN POPUP? If not then I dont need to set cookie for anything or request server for info

    // chrome.cookies.remove({ url: "http://localhost:3001", name: "userID" });
    chrome.cookies.get(
      { url: "http://localhost:3001", name: "userID" },
      function (cookie) {
        if (cookie) {
          setLoggedIn(true);
        } else {
          console.log("Can't get cookie! Check the name!");
        }
      }
    );

    // chrome.storage.sync.get(["loggedin"], function (result) {
    //   if (result.loggedin) {
    //     setLoggedIn(true);
    //   }
    // });
  }, []);

  return (
    <div>
      {/* <div id="buttonDiv"></div> */}
      <h1>Instant Tutor</h1>
      {loggedIn && (
        <div>
          <PopupButton onClick={sendSessionRequestCommand} />
          {lookingForTutor}
          <button onClick={logOut}>Logout</button>
        </div>
      )}
      {!loggedIn && <button onClick={sendLogInCommand}>Log in</button>}
    </div>
  );
}

interface PopupButtonProps {
  onClick: () => void;
}

const PopupButton: React.FC<PopupButtonProps> = ({ onClick }) => {
  return <button onClick={onClick}>Session Request</button>;
};

render(<Popup />, document.getElementById("react-target"));
