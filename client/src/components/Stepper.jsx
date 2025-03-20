import React from "react";
import { motion } from "framer-motion";
import '../index.css'

const Stepper = ({ step }) => {
  const steps = ["Personal", "Weight", "Height", "Lifestyle", "Mobile"];

  return (
    <div className="stepContainer">
      <div className="stepperProgress">
        <motion.div
          className="stepperFill"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="steps">
        {steps.map((label, index) => (
          <div key={index} className={`step ${index <= step ? "active" : ""}`}>
            <span className="step-number"></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
