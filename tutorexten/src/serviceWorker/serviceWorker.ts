function createSessionRequest(sendResponse: any) {
  const navlink: string = "http://localhost:3001/session/";

  function checkActiveSessions(userid: number) {
    const requestBody = {
      userID: userid,
    };

    let timer = setTimeout(checkActiveSessions, 5000, requestBody.userID);

    fetch("http://localhost:3000/checkActiveSessions", {
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
        if (parsedResponse.session.length > 0) {
          clearTimeout(timer);
          sendResponse({ status: "foundTutor", payload: parsedResponse });
          chrome.tabs.create({
            url: navlink + parsedResponse.session[0].id,
          });
        }
      });
  }

  function onCaptured(imageUrl: string) {
    let testid: number = Math.floor(Math.random() * 1000);

    const requestBody = {
      userID: testid,
      screenshotSRC: imageUrl,
    };

    fetch("http://localhost:3000/insertSessionReq", {
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
        checkActiveSessions(requestBody.userID);
        sendResponse({
          status: "ok",
          payload: parsedResponse,
        });
      });
  }

  function onError(error: string): void {
    console.log(`Error: ${error}`);
    sendResponse({ status: "error", payload: error });
  }

  chrome.tabs.captureVisibleTab().then(onCaptured, onError);
}

function onMessage(
  req: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: any
) {
  if (req.command === "sessionreq") {
    createSessionRequest(sendResponse);
    return true;
  }
}

chrome.runtime.onMessage.addListener(onMessage);
