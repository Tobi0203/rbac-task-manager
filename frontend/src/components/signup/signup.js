import React, { useState } from "react";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/signup", FormData);
      console.log("signup successfully", res);
      // alert("account created");
      toast.success("account created successfully");
      navigate("/login");
    } catch (error) {
      console.log("signup error", error.response?.data || error.message);
      // alert("signup failed.please try again");
      toast.error("signin failed. Please try again.");
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...FormData,
      [e.target.name]: e.target.value
    });
  };
  const handleGoogleSuccess = async (credentialResponse) => {
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        const res = await axios.post("http://localhost:3001/google-login", decoded);
        console.log("Google login success", res.data);
        toast("Google login successful");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/home");
      } catch (error) {
        console.error("Google login failed:", error);
        alert("Google login failed");
      }
    };

  return (
    <div className="main-signup">
      <div className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" className="input-field" name="name" onChange={handleChange} />
          <input type="email" placeholder="Email" className="input-field" name="email" autoComplete="email" onChange={handleChange} />
          <input type="password" placeholder="Password" className="input-field" name="password" autoComplete="current-password" onChange={handleChange} />
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <p>already have an acount? <Link to="/Login" className="link"> Login</Link></p>
        {/* <div className="divider">----------------------or----------------------</div> */}
        <br></br>
        <hr style={{borderTop:"1px dashed gray"}}/>
        <br/>
        {/* <button className="Google"  onClick={login}>Continue with Google</button> */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Google login error")}
        />

      </div>
    </div>
  );
}