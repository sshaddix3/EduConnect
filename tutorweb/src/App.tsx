import React from "react";
import { AuthCheck } from "./shared/AuthCheck";
import { AuthProvider } from "./contexts/auth";

interface IAppProps {
  children?: React.ReactNode;
}

export const App: React.FC<IAppProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthCheck>{children}</AuthCheck>
    </AuthProvider>
  );
};
