
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

// Redirect from the old Index page to the Dashboard
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
