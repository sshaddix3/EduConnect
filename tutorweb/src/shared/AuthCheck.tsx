import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth";

interface IAuthCheckProps {
  children: React.ReactNode;
}

export const AuthCheck: React.FC<IAuthCheckProps> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const auth = useAuth();

  useEffect(() => {
    fetch("http://localhost:3000/auth", {
      method: "GET",
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {isLoading && <div>Loading ... </div>}
      {!isLoading && children}
    </>
  );
};
