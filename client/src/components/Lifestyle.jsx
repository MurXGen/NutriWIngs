import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Ruler, ChevronLeft, ChevronRight, Activity, MessageCircleWarning } from "lucide-react";
import LoginRedirect from "./LoginRedirect";

const Lifestyle = ({ data, onChange, onNext, onPrev }) => {
  const lifestyles = [
    { value: "Active", description: "You exercise regularly and have a physically demanding job." },
    { value: "Moderately Active", description: "You exercise occasionally and have a moderate activity level." },
    { value: "Sedentary", description: "You rarely exercise and have a desk job." },
  ];

  return (
    <motion.div className="RegisterComponent" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>

      <div className="componentHeading">
        <Activity />
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          ... Your Lifestyle
        </motion.h2>
      </div>
      <div className="lifestyleContainer">


        {lifestyles.map((item) => (
          <div
            key={item.value}
            className={`lifestyleBox ${data.lifestyle === item.value ? "lifestyleBoxSelected" : ""}`}
            onClick={() => onChange("lifestyle", item.value)}
          >
            <h3>{item.value}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
      <div className="actionButtons">
        <button className="back" onClick={onPrev}><ChevronLeft /></button>
        <button className="proceed" onClick={onNext}>
          Proceed <ChevronRight />
        </button>
      </div>
    <LoginRedirect/>
    </motion.div>
  );
};

export default Lifestyle;
