import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./resetPassword.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const email = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/reset-password", {
        email,
        newPassword,
      });
      toast.success(res.data.message);
      localStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="reset-form-container">
      <form className="reset-form" onSubmit={handleReset}>
        <h2>Reset Password</h2>
        <input
        className="reset-input"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button className="reset-button" type="submit">Update Password</button>
      </form>
    </div>
  );
}
