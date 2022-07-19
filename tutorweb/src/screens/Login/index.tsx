import React from "react";
import { useAuth } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const getAuth = () => {
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((parsedResponse) => {
        auth.setAuth(parsedResponse.authUser);
        navigate("/");
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={getAuth}>login</button>
    </div>
  );
};
