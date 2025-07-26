import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./otpverify.css";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const email = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/verify-otp", { email, otp });
      console.log("otp sent successfuly",res.data);
      toast.success("OTP Verified");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="otp-form-container">
      <form className="otp-form" onSubmit={handleVerify}>
        <h2>Enter OTP</h2>
        <input
        className="otp-input"
          type="text"
          placeholder="Enter OTP sent to your email"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button className="otp-button" type="submit">Verify OTP</button>
      </form>
    </div>
  );
}
