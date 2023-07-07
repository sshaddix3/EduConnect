interface IRequestBody {
  idtoken: string;
  role: string;
}

interface IUser {
  id: number;
  email: string;
  name: string;
  role: string;
  firstname: string;
}

let user: IUser | undefined;

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
    let userid: number = user.id;

    const requestBody = {
      userID: userid,
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

const getAuth = (requestBody: IRequestBody, sendResponse: any) => {
  fetch("http://localhost:3000/login", {
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
      user = parsedResponse.authUser;
      console.log(parsedResponse.authUser);
      chrome.cookies.set(
        {
          url: "http://localhost:3001",
          name: "userID",
          value: parsedResponse.authUser.id,
        },
        function (cookie) {
          if (cookie) {
            console.log(cookie.value);
          } else {
            console.log("Can't get cookie! Check the name!");
          }
        }
      );
      sendResponse({
        status: "loggedin",
        payload: parsedResponse.authUser,
      });
    });
};

function handleCredentialResponse(response: any, sendResponse: any) {
  const requestBody: IRequestBody = {
    idtoken: response.credential,
    role: "student",
  };
  getAuth(requestBody, sendResponse);
}

let clientId =
  "375606136975-kj90j2n3qnd3c3ii8b6l7b52pg4coegh.apps.googleusercontent.com";
let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
let nonce = Math.random().toString(36).substring(2, 15);

function onMessage(
  req: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: any
) {
  if (req.command === "login") {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    // Add the OpenID scope. Scopes allow you to access the user’s information.
    authUrl.searchParams.set("scope", "openid profile email");
    authUrl.searchParams.set("nonce", nonce);
    // Show the consent screen after login.
    authUrl.searchParams.set("prompt", "consent");

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      (redirectUrl) => {
        if (redirectUrl) {
          // The ID token is in the URL hash
          const urlHash = redirectUrl.split("#")[1];
          const params = new URLSearchParams(urlHash);
          const jwt = params.get("id_token");

          handleCredentialResponse({ credential: jwt }, sendResponse);
        }
      }
    );

    return true;
  }

  if (req.command === "sessionreq") {
    createSessionRequest(sendResponse);
    return true;
  }
}

chrome.runtime.onMessage.addListener(onMessage);
