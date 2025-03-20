import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const userId = localStorage.getItem("userId"); // ✅ Check userId from localStorage
  console.log("ProtectedRoute Check - Authenticated:", userId ? true : false);

  return userId ? <Outlet /> : <Navigate to="/welcome" />;
};

export default ProtectedRoute;
