import React from "react";
import { useNavigate } from "react-router-dom";
import RegisterNavbar from "../components/Navbar";
import WelcomeIcon from '../assets/welcomeIllus.svg'
import { Ruler, ChevronLeft, ChevronRight,MessageCircleWarning } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");  // Navigate to login page
  };

  const handleRegisterClick = () => {
    navigate("/register");  // Navigate to register page
  };

  return (
    <div className="welcomeContainer">
      <RegisterNavbar />
      <div className="componentHeading">
        <span style={{ display: 'flex', fontSize:'24px',flexDirection: 'column', lineHeight:'52px', margin: '12px 0' }}>You're just few steps away<span style={{ fontSize: '42px', fontWeight: '600' }}>Healthifying <br/>Your Life</span></span>

      </div>
      <img src={WelcomeIcon} alt="" style={{width:'100%'}} />
      <div className="actionButtons">
        <button className="back" onClick={handleLoginClick}>Login <ChevronRight /></button>
        <button className="proceed" onClick={handleRegisterClick}>
          Register <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Welcome