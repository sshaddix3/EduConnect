


function createSessionRequest(sendResponse:any) {
    function onCaptured(imageUrl: string) {
        const requestBody = {
          userID: 12345,
          screenshotSRC: imageUrl,
        };
    
        fetch("http://localhost:3000/scr", {
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
            sendResponse({
                status: "ok",
                payload: parsedResponse
            });
          });
    }
    
    function onError(error: string): void {
        console.log(`Error: ${error}`);
        sendResponse({status: "error", payload: error});
    }

    chrome.tabs.captureVisibleTab()
        .then(onCaptured, onError);
}

function onMessage(req: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (req.command === "sessionreq") {
        createSessionRequest(sendResponse);
        return true;
    }
}

chrome.runtime.onMessage.addListener(onMessage);

