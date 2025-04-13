import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!userId); // true if userId exists
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // optional loader

  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" />;
};

export default ProtectedRoute;
