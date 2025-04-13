
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import LoginScreen from "./components/auth/LoginScreen";
import AppLayout from "./components/layout/AppLayout";
import OnboardingProcess from "./components/auth/OnboardingProcess";

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

  // If user hasn't completed onboarding, show the onboarding process
  if (!user.onboardingCompleted) {
    return <OnboardingProcess />;
  }

  // User is logged in and has completed onboarding, show the app layout with the current route content
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default MainApp;
