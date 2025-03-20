import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Ruler, ChevronLeft, ChevronRight, MessageCircleWarning } from "lucide-react";
import '../index.css';
import LoginRedirect from "./LoginRedirect";

const Height = ({ data, onChange, onNext, onPrev }) => {
  const [inputValue, setInputValue] = useState(data.height || "150");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      setError("");
      return;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }

    if (numValue < 10 || numValue > 250) {
      setError("You are going above the specified range (10-250)");
      return;
    }

    setError("");
    onChange("height", numValue);
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onChange("height", value);
  };

  return (
    <motion.div className="RegisterComponent" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
      <div className="componentHeading">
        <Ruler />
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          ... Your Height
        </motion.h2>
      </div>
      <div className="weightContainer">
        <motion.input
          type="range"
          min="10"
          max="250"
          value={data.height}
          onChange={handleSliderChange}
        />

        <div className="inputContainer">
          <div className="inputPack">
            <motion.input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter height"
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <span className="inputMeasure">cm</span>
          </div>

          {/* Animated Error Message */}
          {error && (
            <motion.span
              className="error"
              initial={{ scale: 0, opacity: 0 }} // Start small and invisible
              animate={{ scale: 1, opacity: 1 }} // Pop out to full size
              exit={{ scale: 0, opacity: 0 }} // Shrink and fade out
              transition={{ type: "spring", stiffness: 300, damping: 20 }} // Spring animation
            >
              <MessageCircleWarning /> {error}
            </motion.span>
          )}
        </div>

        <div className="actionButtons">
          <button className="back" onClick={onPrev}><ChevronLeft /></button>
          <button className="proceed" onClick={onNext}>
            Proceed <ChevronRight />
          </button>
        </div>
      </div>
      <LoginRedirect/>
    </motion.div>
  );
};

export default Height;