// components/Home.js
import React, { useEffect, useState } from "react";
import "./Home.css"; // Optional CSS
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");

    if ( !storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    // localStorage.removeItem("isLoggedIn");
    // localStorage.removeItem("user");
    // localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1>Welcome to Home Page</h1>
      {user && (
        <div className="user-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <br/>
      <Link to="/toDoList"><button className="logout-button">Task Manager</button></Link>
    </div>
  );
}
