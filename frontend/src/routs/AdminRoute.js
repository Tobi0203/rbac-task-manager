// src/routs/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    return decoded.role === "admin" ? children : <Navigate to="/login" />;
  } catch {
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
