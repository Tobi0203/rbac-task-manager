import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import Navbar from "./components/navbar/navbar.js";
import LandingPage from "./components/landing.js";
import Login from "./components/login/login.js";
import Signup from "./components/signup/signup.js";
import Home from "./components/Home/Home.js";
import ResetPassword from "./components/resetPassword/resetPassword.js";
import ForgetPassword from "./components/forgetPassword/forgetPassword.js";
import TodoCont from "./components/ToDoList/todolist.js";
import VerifyOTP from "./components/otpverify/otpverify.js";
import ProtectedRoute from "./routs/protectedRoute.js";
import AdminRoute from "./routs/AdminRoute.js";
import AdminPanel from "./components/admin/AdminPanel.js";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token has expired
          localStorage.clear();
          setIsLoggedIn(false);
          navigate("/login");
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/login");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location, navigate]);

  return (
    <>
      {!isLoggedIn && <Navbar />}
      {/* <Router> */}
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotPassword" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>} />
          <Route path="/toDoList" element={
            <ProtectedRoute>
              <TodoCont />
            </ProtectedRoute>
          } />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

        </Routes>
      </div>
      {/* </Router> */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
