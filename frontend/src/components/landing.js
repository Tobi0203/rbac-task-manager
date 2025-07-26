import React from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>Welcome to MyApp</h1>
      <p>Your go-to platform for task management and productivity.</p>

      <div className="features">
        <div>✅ Simple Signup & Secure Login</div>
        <div>📊 Track your daily goals</div>
        <div>🔒 Protected content just for you</div>
        <div>📱 Use it on any device</div>
      </div>
    </div>
  );
}
