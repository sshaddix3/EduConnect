import React, { useMemo } from "react";
import { IUser } from "../../types";

interface IAuthContext {
  authUser?: IUser;
  setAuth: (user: IUser) => void;
}

interface IAuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = React.createContext<IAuthContext>({
  authUser: undefined,
  setAuth: () => {},
});

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = React.useState<IUser | undefined>(undefined);

  const setAuth = (user: IUser) => {
    setAuthUser(user);
  };

  const value = useMemo(() => {
    return { authUser, setAuth };
  }, [authUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContext => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
