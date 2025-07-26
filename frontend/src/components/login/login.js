import axios from "axios";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", loginData);
      console.log("login successful", res.data);
      toast.success("Login successful");
      const user=res.data.user;
      console.log(user.role);
      // localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
    } catch (error) {
      console.log("login error", error.response?.data || error.message);
      toast.error("Login failed. Please try again.");
    }
  };


  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post("http://localhost:3001/google-login", decoded);
      console.log("Google login success", res.data);
      toast.success("Google login successful");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed");
    }
  };

  return (
    <div className="main-cont">
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="input-field" name="email" autoComplete="email" onChange={handleChange} />
          <input type="password" placeholder="Password" className="input-field" name="password" autoComplete="current-password" onChange={handleChange} />
          <button type="submit" className="login-button" >Login</button>
        </form>
        <Link to="/forgotPassword"><p>forget password</p></Link>
        <p>Dont hava an account? <Link to="/signup" className="link">sign up</Link></p>
        {/* <div className="divider">----------------------or----------------------</div> */}
        <br/>
        <hr style={{ borderTop: '1px dashed gray' }} />
        <br></br>
        {/* <button className="Google"  onClick={login}>Continue with Google</button> */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Google login error")}
        />

      </div>
    </div>
  );
}