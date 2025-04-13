
import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "../types";
import { getCurrentUser, setCurrentUser, clearCurrentUser, saveUser } from "../utils/storage";

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = (loggedInUser: User) => {
    setCurrentUser(loggedInUser.id);
    setUser(loggedInUser);
  };

  const logout = () => {
    clearCurrentUser();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
