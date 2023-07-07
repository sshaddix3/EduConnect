import React, { useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";

declare const google: any;

const clientID =
  "375606136975-b84mvnu5hnnvlbna6k9e1aorf10cigtd.apps.googleusercontent.com";

interface IRequestBody {
  idtoken: string;
  role: string;
}

export const TutorLogin = () => {
  const [role, setRole] = React.useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  let idToken: string | null = null;

  //Body of getAuth is idToken from google account

  const onSuccess = (response: any) => {
    console.log(`Login Success: ${response}`);
  };

  const onFailure = (response: any) => {
    console.log(`Login Failed`);
  };

  const getAuth = (requestBody: IRequestBody) => {
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
        console.log(parsedResponse);
        auth.setAuth(parsedResponse.authUser);
        navigate("/");
      });
  };

  function handleCredentialResponse(response: any) {
    const requestBody: IRequestBody = {
      idtoken: response.credential,
      role: "tutor",
    };
    getAuth(requestBody);
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:
        "375606136975-b84mvnu5hnnvlbna6k9e1aorf10cigtd.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" } // customization attributes
    );
    google.accounts.id.prompt();
  }, []);

  return (
    <div className="login-container">
      <h1>Tutor Login</h1>
      <div id="buttonDiv"></div>
    </div>
  );
};
