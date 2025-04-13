
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainApp from "./MainApp";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import MyPosts from "./pages/MyPosts";
import AvailableFood from "./pages/AvailableFood";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const queryClient = new QueryClient();

const App = () => {
  // Update document title
  useEffect(() => {
    document.title = "Dasher";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainApp />}>
                  <Route index element={<Dashboard />} />
                  <Route path="map" element={<MapView />} />
                  <Route path="my-posts" element={<MyPosts />} />
                  <Route path="available" element={<AvailableFood />} />
                  <Route path="activity" element={<Activity />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
