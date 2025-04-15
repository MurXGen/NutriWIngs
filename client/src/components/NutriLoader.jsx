import React from "react";
import NutriIcon from "../assets/NutriIcon.svg"

const NutriLoader = () => {
  return (
    <div className="nutri-loader-container">
      <img src={NutriIcon} alt="Loading..." className="nutri-loader-icon" />
    </div>
  );
};

export default NutriLoader;
