import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthorNavbar from "../components/AuthorNavbar";
import BmiHeading from '../assets/BmiHeading.svg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bmi, setBmi] = useState(0);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiStatus, setBmiStatus] = useState("");
  const [showInputs, setShowInputs] = useState(false); // State to toggle input section

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Fetch user details and calculate BMI on component load
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/session", { withCredentials: true });
        setUser(response.data);

        // Set weight & height for BMI calculation
        const userWeight = response.data.healthDetails.weight;
        const userHeight = response.data.healthDetails.height;
        setWeight(userWeight);
        setHeight(userHeight);

        // Calculate default BMI
        const bmiValue = calculateBMI(userWeight, userHeight);
        setBmi(bmiValue);
        setBmiStatus(getBmiStatus(bmiValue));

        // Animate BMI value from 0 to the calculated value
        animateBmiValue(0, bmiValue);
      } catch (error) {
        console.error("Error fetching user session:", error);
        navigate("/welcome"); // Redirect to welcome page if user not logged in
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  // BMI calculation function
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100; // Convert height from cm to meters
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  // Get BMI status (Underweight, Normal, Overweight, Obese)
  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 24.9) return "Normal";
    if (bmi >= 25 && bmi < 29.9) return "Overweight";
    return "Obese";
  };

  // Get progress bar color based on BMI status
  const getProgressBarColor = (bmi) => {
    if (bmi < 18.5) return "#FFA500"; // Orange for underweight
    if (bmi >= 18.5 && bmi < 24.9) return "#4CAF50"; // Green for normal
    if (bmi >= 25 && bmi < 29.9) return "#FFA500"; // Orange for overweight
    return "#F44336"; // Red for obese
  };

  // Animate BMI value from 0 to the target value
  const animateBmiValue = (start, end) => {
    let current = start;
    const interval = setInterval(() => {
      current += 1;
      setBmi(current.toFixed(2));
      if (current >= end) clearInterval(interval);
    }, 50); // Adjust speed of counting
  };

  // Handle BMI update when user changes weight or height
  const handleBmiUpdate = () => {
    if (!weight || !height) {
      alert("Please enter weight and height to calculate BMI.");
      return;
    }
    const newBmi = calculateBMI(weight, height);
    setBmiStatus(getBmiStatus(newBmi));

    // Animate BMI value from 0 to the new value
    animateBmiValue(0, newBmi);
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/welcome" />;

  return (
    <div className="dashboard">
      <AuthorNavbar />

      <div className="bmiTool">
        <div className="toolHeading">
          <img src={BmiHeading} alt="Check BMI" />
          <span>Body Mass Index (BMI)</span>
        </div>
        <div className="bmiMetric">
          {/* Half-Circle Progress Bar */}
          <div className="halfCircleProgress">
            <div
              className="progressBar"
              style={{
                transform: `rotate(${(bmi / 40) * 180 - 180}deg)`, // Adjusted rotation
                borderTopColor: getProgressBarColor(bmi),
                borderLeftColor: getProgressBarColor(bmi),
              }}
            ></div>
            <div className="bmiValue">{bmi}</div>
          </div>
          <div className="bmiDescription">{bmiStatus}</div>
        </div>

        {/* Toggle Button */}
        <button className="toggleButton" onClick={() => setShowInputs(!showInputs)}>
          {showInputs ? "Hide BMI Checker" : "Check for Others"}
        </button>

        {/* Input Section (Conditional Rendering) */}
        {showInputs && (
          <div className="bmiInputs">
            <div className="bmiInput">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="bmiInput">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <button className="checkButton" onClick={handleBmiUpdate}>
              Check BMI
            </button>
          </div>
        )}
      </div>

      {/* Button to Redirect to Diet Tracker */}
      <div className="calorieTrackers">
        <div className="dietMetrics">
          <button className="dietTrackerButton" onClick={() => navigate("/diet-tracker")}>
            Go to Diet Tracker
          </button>
          <button className="dietTrackerButton" onClick={() => navigate("/workout")}>
            Go to Workout Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;