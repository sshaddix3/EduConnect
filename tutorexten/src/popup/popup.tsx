import * as React from "react";
import { useState } from "react";
import { render } from "react-dom";

function Popup() {
  const [imgSrc, setImgSrc] = useState("");

  function sendSessionRequestCommand(): void {
    chrome.runtime.sendMessage({ command: "sessionreq" }, function (response) {
      if (response.status === "ok") {
      } else if (response.status === "error") {
      }
    });
  }

  // function onCaptured(imageUrl: string) {
  //   console.log(imageUrl);
  //   setImgSrc(imageUrl);

  //   const requestBody = {
  //     userID: 12345,
  //     screenshotSRC: imgSrc,
  //   };

  //   fetch("http://localhost:3000/scr", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //     body: JSON.stringify(requestBody),
  //   })
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((parsedResponse) => {
  //       console.log(parsedResponse);
  //     });
  // }

  // function onError(error: string): void {
  //   console.log(`Error: ${error}`);
  // }

  // const captureTab = (): void => {
  //   let taburl = chrome.tabs.captureVisibleTab();
  //   taburl.then(onCaptured, onError);
  // };

  return (
    <div>
      <h1>Hello, world!</h1>
      <p>popup!</p>
      <PopupButton onClick={sendSessionRequestCommand} />
      {imgSrc != "" && <img src={imgSrc} width="550" height="300"></img>}
    </div>
  );
}

interface PopupButtonProps {
  onClick: () => void;
}

const PopupButton: React.FC<PopupButtonProps> = ({ onClick }) => {
  return <button onClick={onClick}>Click</button>;
};

render(<Popup />, document.getElementById("react-target"));
