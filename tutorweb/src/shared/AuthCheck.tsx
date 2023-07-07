import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth";

interface IAuthCheckProps {
  children: React.ReactNode;
}

//

// AuthCheck is a component that checks if the user is logged in?
// Would you grab the userinfo via a cookie?

//Student would need to be authenticated to see session page they are redirected to
//Student login info would be grabbed from extension via google account?
// querystring?

/*Would be nice if tutors could create account with google and when they come to website
Run through this authCheck to negate any log in process for student or tutor*/

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
        /*Would take user info on launch (from google acct or cookie?) 
        and compare to userinfo in database, 
        //if match, setAuth to that user? 
        Like below? */

        auth.setAuth(parsedResponse.authUser);
        console.log(parsedResponse);
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
