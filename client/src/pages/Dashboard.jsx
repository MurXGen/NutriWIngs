import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthorNavbar from "../components/AuthorNavbar";
import BmiHeading from '../assets/BmiHeading.svg';
import { StopCircle,Salad, Dumbbell, Calculator, MoveLeft, BadgeInfo, Sparkles, Droplets, CircleX, CirclePlus, ArrowRight, Lamp, CircleFadingPlus, Hourglass, Loader2, StopCircle } from 'lucide-react';
import foodTrack from '../assets/Dashboard/foodTrack.svg';
import workoutSession from '../assets/Dashboard/workoutSession.svg';
import Quick from '../assets/Dashboard/quick.svg';
import Proceed from '../assets/Dashboard/proceed.svg';
import Sleep from '../assets/Dashboard/sleepLabel.svg';
import Muscle from '../assets/Dashboard/Muscle.svg';
import BottomNavBar from "../components/BottomNavBar";

// =================== Component =================== //
const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [score, setScore] = useState(0);

  const fetchStrengthScore = async () => {
    try {
      const res = await axios.get(`https://nutriwings.onrender.com/api/strength/daily-score/${userId}`);
      const { totalScore, details } = res.data;
      setScore(totalScore);

      console.clear(); // Optional: clears old logs for better visibility
      console.log("🔥 Strength Score Breakdown 🔥");
      console.log(`Total Score: ${totalScore}/100`);
      console.log("📊 Metric-wise:");
      console.log(`Protein Score: ${details.proteinScore}/20`);
      console.log(`Water Score: ${details.waterScore}/10`);
      console.log(`Fat Score: ${details.fatScore}/5`);
      console.log(`Carb Score: ${details.carbScore}/10`);
      console.log(`Workout Duration: ${details.durationPoints}/20`);
      console.log(`Weekly Consistency Bonus: ${details.consistencyPoints}/5`);
      console.log(`Sleep-Based Intensity: ${details.intensityPoints}/7.5`);
      console.log(`Workout Failure Intensity: ${details.failurePoints}/7.5`);
      console.log(`Workout Action Quality: ${details.actionPoints}/15`);
    } catch (err) {
      console.error("Error fetching strength score", err);
    }
  };

  useEffect(() => {
    fetchStrengthScore();
  }, [userId]);


  const fetchWaterEntries = async () => {
    try {
      const res = await axios.get(`https://nutriwings.onrender.com/api/water/today/${userId}`);
      setWaterHistory(res.data.entries || []);
    } catch (error) {
      console.error('Error fetching water history:', error);
    }
  };

  // Add water entry
  const handleAddWater = async () => {
    if (!waterInput || isNaN(waterInput) || waterInput <= 0) return;
    setIsSubmitting(true);

    try {
      await axios.post(`https://nutriwings.onrender.com/api/water/add/${userId}`, {
        waterContent: Number(waterInput),
      });
      setWaterInput(250); // reset input
      fetchWaterEntries(); // refresh
      setRefresh(prev => !prev); // <--- refetch trigger
    } catch (error) {
      console.error('Error adding water entry:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    setIsSubmitting(true);
    try {
      await axios.delete(`https://nutriwings.onrender.com/api/water/delete/${userId}/${entryId}`);
      fetchWaterEntries(); // refresh
      setRefresh(prev => !prev); // <--- refetch trigger
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchTotalWater = async () => {
      try {
        const res = await axios.get(`https://nutriwings.onrender.com/api/water/today/${userId}`);
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
        const res = await axios.get(`https://nutriwings.onrender.com/api/water/today/${userId}`);
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
        const response = await axios.get("https://nutriwings.onrender.com/api/daily-metrics", { withCredentials: true });
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
        const response = await axios.get("https://nutriwings.onrender.com/api/auth/session", { withCredentials: true });
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
        const res = await axios.get(`https://nutriwings.onrender.com/api/sleep/latest/${userId}`);
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
        const res = await axios.get(`https://nutriwings.onrender.com/api/sleep/total/${userId}`);
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
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const res = await axios.post("https://nutriwings.onrender.com/api/sleep/start", {
        userId,
        startDateTime: now,
      });

      setStartDateTime(res.data.startDateTime);
      setElapsedTime(0);
      setShowTimer(true);
      setShowInput(false);
    } catch (error) {
      console.error("Error starting sleep:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    setIsSubmitting(true);
    try {
      const end = new Date().toISOString();
      await axios.post("https://nutriwings.onrender.com/api/sleep/stop", {
        userId,
        endDateTime: end,
        duration: elapsedTime,
      });

      setShowTimer(false);
      setStartDateTime(null);
      setElapsedTime(0);
      fetchSleepEntries(); // ✅ Refresh after timer stops
    } catch (error) {
      console.error("Error stopping sleep:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEnterDuration = () => {
    setShowInput(true);
    setShowTimer(false);
  };

  // Submit duration with unit conversion
  const handleSubmitDuration = async () => {
    setIsSubmitting(true);
    try {
      const value = parseInt(durationValue);
      if (isNaN(value) || value <= 0) return;
      const end = new Date().toISOString();

      const durationInSeconds = durationUnit === "hours" ? value * 3600 : value * 60;

      await axios.post("https://nutriwings.onrender.com/api/sleep/manual", {
        userId,
        duration: durationInSeconds,
        endDateTime: end,
      });

      setDurationValue("");
      setShowInput(false);
      fetchSleepEntries(); // Refresh after entry
    } catch (error) {
      console.error("Error submitting manual sleep:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a specific entry
  const handleDeleteSleepEntry = async (entryId) => {
    setIsSubmitting(true);
    try {
      await axios.delete(`https://nutriwings.onrender.com/api/sleep/delete/${userId}/${entryId}`);
      fetchSleepEntries(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting sleep entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State to store manual entries
  const [sleepEntries, setSleepEntries] = useState([]);

  // Fetch today's sleep entries
  const fetchSleepEntries = async () => {
    try {
      const res = await axios.get(`https://nutriwings.onrender.com/api/sleep/entries/${userId}`);
      const entries = res.data.entries || [];

      console.log("Fetched entries:", entries);

      setSleepEntries(entries);

      // ✅ Calculate total duration from all entries
      const total = entries.reduce((sum, entry) => sum + (entry.totalDuration || 0), 0);
      setTotalSleepDuration(total); // 👈 this updates your UI
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


      <div className="strengthCalculator">
        <div className="labelCont">
          <Sparkles color="#5ba2fe" size={"16px"} />
          <span>Body Overall Growth</span>
        </div>

        <div className="progressMuscleBar">
          <div className="progressValue">
            <span>{score} <span style={{ fontSize: '12px' }}>/ 100</span></span>
          </div>
          <div className="progress">
            <motion.div
              className="progressFill"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>
          {/* <div className="progressIcon">
            <img src={Muscle} alt="Muscle Icon" />
          </div> */}
        </div>

        <div className="progressInfo">
          <span className={score < 50 ? 'highlight' : ''}>Less Growth &lt; 50</span>
          <span className={score >= 50 && score < 60 ? 'highlight' : ''}>Balanced ≥ 50 &amp; &lt; 60</span>
          <span className={score >= 60 && score < 80 ? 'highlight' : ''}>Stronger ≥ 60 &amp; &lt; 80</span>
          <span className={score >= 80 ? 'highlight' : ''}>Strongest ≥ 80%</span>
        </div>

        <div className="note">
          <BadgeInfo size="24px" />
          <span>We use your Nutritional intake, Workout reps & failures to measure this metric</span>
        </div>

        <button className="toggleButton" onClick={() => navigate("/strength-metrics")}>Analyse<ArrowRight /></button>
      </div>

      <motion.div className="otherMetrics" initial="hidden" animate="visible" variants={popInEffect}>
        {/* Calories */}
        <div className="dietCalories">
          <div className="labelCont">
            <img src={foodTrack} alt="Food track" />
            <span>Calories Intake</span>
          </div>
          <div className="showValues">
            <span className="value">{totalCalories}</span>
            <span className="valueLabel">Kcal</span>
          </div>
          <div className="quickActions">
            <button className="primarySmallButton" onClick={() => navigate("/log-diet")}>
              <img src={Quick} alt="Quick log" />
            </button>
            <button className="primarySmallButton" onClick={() => navigate("/diet-tracker")}>
              <img src={Proceed} alt="Proceed to diet tracker" />
            </button>
          </div>
        </div>

        {/* Workout */}
        <div className="workoutDuration">
          <div className="labelCont">
            <img src={workoutSession} alt="Workout track" />
            <span>Workout Session</span>
          </div>
          <div className="showValues">
            <span className="value">{totalDuration}</span>
            <span className="valueLabel">Minutes</span>
          </div>
          <div className="quickActions">
            <button className="primarySmallButton" onClick={() => navigate("/loglive-workout")}>
              <img src={Quick} alt="Quick log workout" />
            </button>
            <button className="primarySmallButton" onClick={() => navigate("/workout")}>
              <img src={Proceed} alt="Proceed to workout tracker" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="waterTrack">
        <div className="labelCont">
          <Droplets color="#5ba2fe" size={"24px"} />
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


            <div className="waterInput">
              <span>Add Water Intake (ml)</span>
              <div className="inputAdd">
                <input
                  type="number"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                />
                <button
                  onClick={handleAddWater}
                  className="save-button"
                  disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 color="white" size={12} /> : <CirclePlus color="white" />}
                </button>
              </div>

            </div>

            <div className="waterHistory">
              <span>History</span>
              <div className="waterHistoryContent">
                {waterHistory.length === 0 ? (
                  <span>No water entries for today.</span>
                ) : (
                  waterHistory.map((entry) => (

                    <div key={entry._id} className="entryRow">
                      <span>{entry.waterContent} ml</span>
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="save-button"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 size={"16px"} /> : <CircleX size={"16px"} />}

                      </button>
                    </div>


                  ))
                )}
              </div>
            </div>
          </div>

        </div>
        <div className="note">
          <BadgeInfo size={"12px"} />
          <span>Hydrate to fresh mind and skin</span>
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
            <span style={{ fontSize: '12px', borderBottom: '1px solid ' }}>{formatSleepDuration(totalSleepDuration)}</span>
          </div>
        </div>

        <motion.div className="sleepActions" layout>
          {!showTimer && !showInput && (
            <>
              <motion.button onClick={handleStart} whileTap={{ scale: 0.9 }}>
                <Hourglass size={"16px"} />
                Start Timer
              </motion.button>
              <motion.button onClick={handleEnterDuration} whileTap={{ scale: 0.9 }}>
                <CircleFadingPlus size={"16px"} />
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
                <motion.button
                  className="save-button"
                  disabled={isSubmitting}
                  onClick={handleStop}
                  whileTap={{ scale: 0.95 }}>
                    
                  {isSubmitting ? <Loader2 size={12} /> : <StopCircle size={12}>}

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
              <div className="backOption" onClick={() => window.location.reload()}>
                <MoveLeft size={"16px"} />
              </div>
              <div className="inputAction">
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


              </div>
              <motion.button
                className="save-button"
                disabled={isSubmitting}
                onClick={handleSubmitDuration}
                whileTap={{ scale: 0.95 }}>
                {isSubmitting ? <Loader2 color="white" /> : <ArrowRight color="white" />}

              </motion.button>





            </motion.div>
          )}

        </AnimatePresence>

        {(!showTimer && !showInput) && (
          <div className="sleepHistory">
            <span>History</span>
            {sleepEntries.length === 0 && <p>No records yet.</p>}

            <div className="sleepEnteries">
              {sleepEntries.map((entry) => (
                <div className="sleepEntry" key={entry._id}>
                  <span>{formatSleepEntryDuration(entry.totalDuration)}</span>
                  <button
                    className="save-button"
                    disabled={isSubmitting}
                    onClick={() => handleDeleteSleepEntry(entry._id)}>
                    {isSubmitting ? <Loader2 size={"16px"} /> : <CircleX size={"16px"} />}

                  </button>
                </div>
              ))}
            </div>

          </div>
        )}


      </div>

      {/* --- BMI Tracker --- */}
      <div className="bmiTool">
        <div className="toolHeading">
          <Calculator color="#5BA2FE" size={"16px"} />
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
                boxShadow: '1px 4px 8px #5ba2fe80',
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
      <BottomNavBar />
    </div >
  );
};

export default Dashboard;