import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NameAgeGender from "../components/NameAgeGender";
import Weight from "../components/Weight";
import Height from "../components/Height";
import Lifestyle from "../components/Lifestyle";
import MobilePin from "../components/MobilePin";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";


const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    lifestyle: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleRegister = async () => {
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords must match!");
      return;
    }
    try {
      const response = await axios.post("https://nutriwings.onrender.com/api/auth/register", {
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        mobile: userData.mobile,
        password: userData.password,
        healthDetails: {
          weight: userData.weight || 65,
          height: userData.height || 150,
          lifestyle: userData.lifestyle,
        },
      });
      alert("Registration successful!");
      localStorage.setItem("userId", response.data.userId);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="registerContainer">
      <Navbar/>
      <div className="boxDesign">
      </div>
      <div className="boxDesign2">

      </div>
      <Stepper step={step} />
      {step === 0 && <NameAgeGender data={userData} onChange={handleChange} onNext={nextStep} />}
      {step === 1 && <Weight data={userData} onChange={handleChange} onNext={nextStep} onPrev={prevStep} />}
      {step === 2 && <Height data={userData} onChange={handleChange} onNext={nextStep} onPrev={prevStep} />}
      {step === 3 && <Lifestyle data={userData} onChange={handleChange} onNext={nextStep} onPrev={prevStep} />}
      {step === 4 && <MobilePin data={userData} onChange={handleChange} onSubmit={handleRegister} onPrev={prevStep} />}
    </div>
  );
};

export default Register;

