import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NutriIcon from '../assets/NutriIcon.svg'

const RegisterNavbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      className="register-navbar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        <img src={NutriIcon} alt="NutriLogo" style={{cursor:'pointer',width:'80px'}} onClick={() => navigate("/")}/>
    </motion.nav>
  );
};

export default RegisterNavbar;