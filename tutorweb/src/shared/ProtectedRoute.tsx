import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";

interface IProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
}) => {
  const auth = useAuth();
  if (auth.authUser === undefined) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
