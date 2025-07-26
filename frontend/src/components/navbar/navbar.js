import { useState, useEffect } from "react";
import { Link,useNavigate,useLocation} from "react-router-dom";
import "./navbar.css";
import logo from "../image/PngItem_6503651.png";
import { TiThMenu } from "react-icons/ti";
import { MdClose } from "react-icons/md";

function Navbar() {
  const navigate=useNavigate();
  const location=useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [loggedIn,setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const toggleDiv = () => {
    setIsClicked(!isClicked);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(()=>{
    setIsLoggedIn(!!localStorage.getItem("token"))
  },[location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="navbarmain">
      <div className="logo">
        <img src={logo} alt="logo" />
        Roshan Sameer
      </div>
      {isMobile && !isClicked && (
        loggedIn ?<button className="nav-button mobout" onClick={handleLogout}>logout</button>:<div className="mobin">
            <Link to="/login"><button className="nav-button">Login</button></Link>or
            <Link to="/signup"><button className="nav-button">Signup</button></Link></div>
      )}
      {isMobile && !isClicked && (
        <TiThMenu className="icon" onClick={toggleDiv} />
      )}
      <div className={isMobile ? (isClicked ? "mobmenu open" : "mobmenu") : "menu"}>
        {isMobile && isClicked && (
          <MdClose className="iconclose" onClick={toggleDiv} />
        )}
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
          {loggedIn ?<button className="nav-button" onClick={handleLogout}>logout</button>:<li>
            <Link to="/login"><button className="nav-button">Login</button></Link> or{" "}
            <Link to="/signup"><button className="nav-button">Signup</button></Link>
          </li>}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
