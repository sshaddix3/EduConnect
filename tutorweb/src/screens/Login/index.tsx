import React, { useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

declare const google: any;

export const Login = () => {
  return (
    <div className="login-container">
      <h1>Login</h1>
      <div id="buttonDiv"></div>
      <Link to="/studentlogin">Login as Student</Link>
      <Link to="/tutorlogin">Login as Tutor</Link>
    </div>
  );
};
