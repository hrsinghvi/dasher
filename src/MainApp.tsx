
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import LoginScreen from "./components/auth/LoginScreen";
import AppLayout from "./components/layout/AppLayout";

const MainApp: React.FC = () => {
  const { user, isLoading } = useUser();

  // Show loading state if we're still checking for a logged-in user
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If no user is logged in, show the login screen
  if (!user) {
    return <LoginScreen />;
  }

  // User is logged in, show the app layout with the current route content
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default MainApp;
