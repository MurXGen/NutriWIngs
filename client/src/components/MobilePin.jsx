import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Ruler, ChevronLeft, ChevronRight, Activity, PartyPopper } from "lucide-react";
import LoginRedirect from "./LoginRedirect";


const MobilePin = ({ data, onChange, onSubmit, onPrev }) => {
  return (
    <motion.div className="RegisterComponent" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
    
      <div className="componentHeading">
        <PartyPopper />
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Hurrey ! That's it ...
        </motion.h2>
      </div>
      <div className="inputContainer">
        <div className="inputPack">
          <span className="inputMeasure">+91</span>
          
          <motion.input
            type="text"
            placeholder="Mobile Number"
            value={data.mobile}
            onChange={(e) => onChange("mobile", e.target.value)}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />

        </div>

        <motion.input
          type="password"
          placeholder="Set 4-Digit PIN"
          value={data.password}
          onChange={(e) => onChange("password", e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <motion.input
          type="password"
          placeholder="Confirm PIN"
          value={data.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />

      </div>
      <div className="actionButtons">
        <button className="back" onClick={onPrev}><ChevronLeft /></button>
        <button className="proceed" onClick={onSubmit}>
          Register  <ChevronRight />
        </button>

      </div>
     <LoginRedirect/>
    </motion.div>
  );
};

export default MobilePin;


