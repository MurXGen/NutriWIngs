import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthorNavbar from "../components/AuthorNavbar";
import BmiHeading from '../assets/BmiHeading.svg';
import { Salad, Dumbbell, CircleX, ArrowRight, Lamp, CircleFadingPlus, Hourglass } from 'lucide-react';
import foodTrack from '../assets/Dashboard/foodTrack.svg';
import workoutSession from '../assets/Dashboard/workoutSession.svg';
import Quick from '../assets/Dashboard/quick.svg';
import Proceed from '../assets/Dashboard/proceed.svg';
import Sleep from '../assets/Dashboard/sleepLabel.svg';

// =================== Component =================== //
const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // ----------- State ----------- //
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bmi, setBmi] = useState(0);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiStatus, setBmiStatus] = useState("");
  const [showInputs, setShowInputs] = useState(false);

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const [startDateTime, setStartDateTime] = useState(null);
  const [duration, setDuration] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalSleepDuration, setTotalSleepDuration] = useState(0); // in seconds

  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("hours"); // 'hours' or 'minutes'

  const [waterInput, setWaterInput] = useState(250);
  const [waterHistory, setWaterHistory] = useState([]);

  const [totalWater, setTotalWater] = useState(0);
  const dailyGoal = 3000; // 3000ml per day
  const [refresh, setRefresh] = useState(false);

  const fetchWaterEntries = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/water/today/${userId}`);
      setWaterHistory(res.data.entries || []);
    } catch (error) {
      console.error('Error fetching water history:', error);
    }
  };

  // Add water entry
  const handleAddWater = async () => {
    if (!waterInput || isNaN(waterInput) || waterInput <= 0) return;

    try {
      await axios.post(`http://localhost:5000/api/water/add/${userId}`, {
        waterContent: Number(waterInput),
      });
      setWaterInput(250); // reset input
      fetchWaterEntries(); // refresh
      setRefresh(prev => !prev); // <--- refetch trigger
    } catch (error) {
      console.error('Error adding water entry:', error);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    try {
      await axios.delete(`http://localhost:5000/api/water/delete/${userId}/${entryId}`);
      fetchWaterEntries(); // refresh
      setRefresh(prev => !prev); // <--- refetch trigger
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  useEffect(() => {
    const fetchTotalWater = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/water/today/${userId}`);
        const total = res.data.entries.reduce((sum, entry) => sum + entry.waterContent, 0);
        setTotalWater(total);
      } catch (err) {
        console.error("Failed to fetch total water:", err);
      }
    };

    if (userId) fetchTotalWater();
  }, [userId, refresh]); // refetch on userId or refresh change

  const fillPercent = Math.min((totalWater / dailyGoal) * 100, 100);
  useEffect(() => {
    if (userId) fetchWaterEntries();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const fetchEntries = async () => {
        const res = await axios.get(`http://localhost:5000/api/water/today/${userId}`);
        const total = res.data.entries.reduce((sum, e) => sum + e.waterContent, 0);
        setTotalWater(total);
      };
      fetchEntries();
    }
  }, [userId]);



  // ----------- Animation Variants ----------- //
  const popInEffect = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  // ----------- Effects ----------- //
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/daily-metrics", { withCredentials: true });
        setTotalCalories(response.data.totalCalories);
        setTotalDuration(response.data.totalDuration);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/session", { withCredentials: true });
        setUser(response.data);
        const userWeight = response.data.healthDetails.weight;
        const userHeight = response.data.healthDetails.height;
        setWeight(userWeight);
        setHeight(userHeight);

        const bmiValue = calculateBMI(userWeight, userHeight);
        setBmi(bmiValue);
        setBmiStatus(getBmiStatus(bmiValue));
        animateBmiValue(0, bmiValue);
      } catch (error) {
        console.error("Error fetching user session:", error);
        navigate("/welcome");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (showTimer && startDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startDateTime);
        const diffInSeconds = Math.floor((now - start) / 1000);
        setElapsedTime(diffInSeconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, startDateTime]);

  useEffect(() => {
    const fetchLatestSleep = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sleep/latest/${userId}`);
        const latest = res.data.latestSleep;

        if (latest && latest.startDateTime && !latest.endDateTime) {
          const start = new Date(latest.startDateTime);

          // ✅ Ensure startDateTime is a valid date
          if (!isNaN(start.getTime())) {
            const diffInSeconds = Math.floor((Date.now() - start.getTime()) / 1000);
            setStartDateTime(latest.startDateTime);
            setElapsedTime(diffInSeconds);
            setShowTimer(true);
          }
        }
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    };

    if (userId) fetchLatestSleep();
  }, [userId]);


  useEffect(() => {
    let interval;
    if (showTimer && startDateTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - new Date(startDateTime)) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, startDateTime]);

  useEffect(() => {
    const fetchTotalSleep = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sleep/total/${userId}`);
        setTotalSleepDuration(res.data.totalDuration || 0);
      } catch (error) {
        console.error("Error fetching total sleep duration:", error);
      }
    };

    if (userId) fetchTotalSleep();
  }, [userId]);

  const formatSleepDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs} hrs ${mins} mins ${secs} s`;
  };




  // ----------- Utility Functions ----------- //
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 24.9) return "Normal";
    if (bmi >= 25 && bmi < 29.9) return "Overweight";
    return "Obese";
  };

  const getProgressBarColor = (bmi) => {
    if (bmi < 18.5) return "#FFA500";
    if (bmi >= 18.5 && bmi < 24.9) return "#4CAF50";
    if (bmi >= 25 && bmi < 29.9) return "#FFA500";
    return "#F44336";
  };

  const animateBmiValue = (start, end) => {
    let current = start;
    const interval = setInterval(() => {
      current += 1;
      setBmi(current.toFixed(2));
      if (current >= end) clearInterval(interval);
    }, 50);
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs} h : ${mins} m : ${secs} s`;
  };

  function formatSleepEntryDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    let result = "";
    if (hours > 0) result += `${hours}hrs `;
    if (minutes > 0) result += `${minutes}mins `;
    if (seconds > 0) result += `${seconds}s`;

    return result.trim() || "0s";
  }


  // ----------- Handlers ----------- //
  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleBmiUpdate = () => {
    if (!weight || !height) {
      alert("Please enter weight and height to calculate BMI.");
      return;
    }
    const newBmi = calculateBMI(weight, height);
    setBmiStatus(getBmiStatus(newBmi));
    animateBmiValue(0, newBmi);
  };

  const handleStart = async () => {
    try {
      const now = new Date().toISOString();
      const res = await axios.post("http://localhost:5000/api/sleep/start", {
        userId,
        startDateTime: now,
      });

      setStartDateTime(res.data.startDateTime);
      setElapsedTime(0);
      setShowTimer(true);
      setShowInput(false);
    } catch (error) {
      console.error("Error starting sleep:", error);
    }
  };

  const handleStop = async () => {
    try {
      const end = new Date().toISOString();
      await axios.post("http://localhost:5000/api/sleep/stop", {
        userId,
        endDateTime: end,
        duration: elapsedTime,
      });

      setShowTimer(false);
      setStartDateTime(null);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error stopping sleep:", error);
    }
  };


  const handleEnterDuration = () => {
    setShowInput(true);
    setShowTimer(false);
  };

  // Submit duration with unit conversion
  const handleSubmitDuration = async () => {
    try {
      const value = parseInt(durationValue);
      if (isNaN(value) || value <= 0) return;

      const durationInSeconds = durationUnit === "hours" ? value * 3600 : value * 60;

      await axios.post("http://localhost:5000/api/sleep/manual", {
        userId,
        duration: durationInSeconds,
      });

      setDurationValue("");
      setShowInput(false);
      fetchSleepEntries(); // Refresh after entry
    } catch (error) {
      console.error("Error submitting manual sleep:", error);
    }
  };

  // Delete a specific entry
  const handleDeleteSleepEntry = async (entryId) => {
    try {
      await axios.delete(`http://localhost:5000/api/sleep/delete/${userId}/${entryId}`);
      fetchSleepEntries(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting sleep entry:", err);
    }
  };

  // State to store manual entries
  const [sleepEntries, setSleepEntries] = useState([]);

  // Fetch today's sleep entries
  const fetchSleepEntries = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/sleep/entries/${userId}`);
      console.log("Fetched entries:", res.data.entries); // 👈 add this
      setSleepEntries(res.data.entries);
    } catch (error) {
      console.error("Error fetching sleep entries:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSleepEntries();
    }
  }, [userId]);



  // ----------- Return JSX ----------- //
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/welcome" />;

  return (
    <div className="dashboard">
      <AuthorNavbar />

      {/* --- Calories and Workout --- */}
      <motion.div className="otherMetrics" initial="hidden" animate="visible" variants={popInEffect}>
        {/* Calories */}
        <div className="dietCalories">
          <div className="labelCont">
            <img src={foodTrack} alt="Food track" />
            <span>Total<br /> Calories</span>
          </div>
          <div className="showValues">
            <span className="value">{totalCalories}</span>
            <span className="valueLabel">Kcal</span>
          </div>
          <div className="quickActions">
            <button className="toggleButton" onClick={() => navigate("/log-diet")}>
              <img src={Quick} alt="Quick log" />
            </button>
            <button className="toggleButton" onClick={() => navigate("/diet-tracker")}>
              <img src={Proceed} alt="Proceed to diet tracker" />
            </button>
          </div>
        </div>

        {/* Workout */}
        <div className="workoutDuration">
          <div className="labelCont">
            <img src={workoutSession} alt="Workout track" />
            <span>Total<br />Workout Duration</span>
          </div>
          <div className="showValues">
            <span className="value">{totalDuration}</span>
            <span className="valueLabel">Minutes</span>
          </div>
          <div className="quickActions">
            <button className="toggleButton" onClick={() => navigate("/loglive-workout")}>
              <img src={Quick} alt="Quick log workout" />
            </button>
            <button className="toggleButton" onClick={() => navigate("/workout")}>
              <img src={Proceed} alt="Proceed to workout tracker" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="waterTrack">
        <div className="labelCont">
          <img src={Sleep} alt="sleep" />
          <span>Water Tracker</span>
        </div>

        <div className="waterContent">
          <div className="waterGlass">
            <div className="waterFill" style={{ height: `${fillPercent}%` }}>
              <div className="wave" />
              <div className="wave wave2" />
              <div className="glassOverlay">
                {totalWater} ml
              </div>
            </div>
          </div>


          <div className="waterActions">
            <div className="note">
              <span>Hydrate to Fresh mind and skin</span>
            </div>

            <div className="waterInput">
              <input
                type="number"
                value={waterInput}
                onChange={(e) => setWaterInput(e.target.value)}
              />
              <span>ml</span>
              <button onClick={handleAddWater}>Add</button>
            </div>

            <div className="waterHistory">
              {waterHistory.length === 0 ? (
                <span>No water entries for today.</span>
              ) : (
                waterHistory.map((entry) => (
                  <div key={entry._id} className="entryRow">
                    <span>{entry.waterContent} ml</span>
                    <button onClick={() => handleDeleteEntry(entry._id)}>🗑</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Sleep Tracker --- */}
      <div className="sleepTrack">
        <div className="labelCont">
          <div>
            <img src={Sleep} alt="sleep" />
            <span>Sleep Tracker</span>
          </div>

          <div className="showTotalDuration">
            <span style={{ color: 'black' }}>{formatSleepDuration(totalSleepDuration)}</span>

          </div>
        </div>

        <motion.div className="sleepActions" layout>
          {!showTimer && !showInput && (
            <>
              <motion.button onClick={handleStart} whileTap={{ scale: 0.9 }}>
                <Hourglass />
                Start Timer
              </motion.button>
              <motion.button onClick={handleEnterDuration} whileTap={{ scale: 0.9 }}>
                <CircleFadingPlus />
                Enter Duration
              </motion.button>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {showTimer && (
            <motion.div
              className="showTimer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="note"><Lamp /> Have a peaceful sleep !</span>
              <div className="timerDisplay">
                <span>{formatTime(elapsedTime)}</span>
                <motion.button onClick={handleStop} whileTap={{ scale: 0.95 }}>
                  Stop
                </motion.button>
              </div>

            </motion.div>
          )}

          {showInput && (
            <motion.div
              className="showDurationInput"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >


              <input
                type="number"
                value={durationValue}
                placeholder={`~ ${durationUnit}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setDurationValue(val);
                  }
                }}
                min="0"
                required
              />

              <div className="durationToggle">
                <button
                  className={`toggleBox ${durationUnit === "hours" ? "selected" : ""}`}
                  onClick={() => setDurationUnit("hours")}
                >
                  Hrs
                </button>
                <button
                  className={`toggleBox ${durationUnit === "minutes" ? "selected" : ""}`}
                  onClick={() => setDurationUnit("minutes")}
                >
                  Mins
                </button>
              </div>


              <motion.button onClick={handleSubmitDuration} whileTap={{ scale: 0.95 }}>

                <ArrowRight color="white" />
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>


        <div className="sleepHistory">
          {sleepEntries.length === 0 && <p>No records yet.</p>}

          <div className="sleepEnteries">
            {sleepEntries.map((entry) => (
              <div className="sleepEntry" key={entry._id}>
                <span>{formatSleepEntryDuration(entry.totalDuration)}</span>
                <button onClick={() => handleDeleteSleepEntry(entry._id)}>
                  <CircleX size={"16px"} />
                </button>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* --- BMI Tracker --- */}
      <div className="bmiTool">
        <div className="toolHeading">
          <img src={BmiHeading} alt="Check BMI" />
          <span>Body Mass Index (BMI)</span>
        </div>
        <div className="bmiMetric">
          <div className="halfCircleProgress">
            <div
              className="progressBar"
              style={{
                transform: `rotate(${(bmi / 40) * 180 - 180}deg)`,
                borderTopColor: getProgressBarColor(bmi),
                borderLeftColor: getProgressBarColor(bmi),
              }}
            ></div>
            <div className="bmiValue">{bmi}</div>
          </div>
          <div className="bmiDescription">{bmiStatus}</div>
        </div>

        <button className="toggleButton" onClick={() => setShowInputs(!showInputs)}>
          {showInputs ? "Hide BMI Checker" : "Check for Others"}
        </button>

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
    </div >
  );
};

export default Dashboard;
