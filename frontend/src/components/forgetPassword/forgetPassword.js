// src/pages/ForgetPassword.js
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./forgetPassword.css";

export default function ForgetPassword() {
  const navigate=useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/forgotPassword", { email });
      toast.success(res.data.message);
      localStorage.setItem("resetEmail", email);
      navigate("/verify-otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="forgot-main-cont">
      <div className="forgot-login-container">
        <h2 className="forgot-login-title">Forgot Password</h2>
        <form className="forgot-login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your registered email"
            className="forgot-input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="forgot-login-button">
            send otp
          </button>
        </form>
      </div>
    </div>
  );
}
