import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    // Assuming 'userId' is the authentication identifier stored in localStorage
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!userId); // true if userId exists
  }, []);

  if (isAuthenticated === null) {
    // You can show a loader or simply return null until the check completes
    return <div>Loading...</div>; // Replace with your actual loader
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" />;
};

export default ProtectedRoute;
