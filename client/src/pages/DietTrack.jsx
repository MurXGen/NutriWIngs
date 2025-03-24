import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CirclePlus, ListTodo, Frown, Laugh } from "lucide-react";
import { motion } from "framer-motion";
import "../DietTrack.css";
import AuthorNavbar from "../components/AuthorNavbar";

const DietTrack = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const today = new Date();

  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState(
    `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}-${String(todayDate).padStart(2, "0")}`
  );

  const [dietStats, setDietStats] = useState({
    totalCalories: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFats: 0,
  });

  const [recomCal, setRecomCal] = useState(null);
  const [calorieData, setCalorieData] = useState({});

  // Animation variants for pop-out effect
  const popOutVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  // Transition for staggered animations
  const popOutTransition = {
    type: "spring",
    stiffness: 100,
    damping: 10,
    delay: 0.2,
  };

  const getDayLabel = (selectedDate) => {
    const today = new Date();
    const selected = new Date(selectedDate);

    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    const timeDiff = selected - today;
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (dayDiff === 0) {
      return "Today";
    } else if (dayDiff === -1) {
      return "Yesterday";
    } else if (dayDiff === -2) {
      return "Day before yesterday";
    } else {
      return selected.toLocaleDateString("en-US", { weekday: "long" });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      focusSelectedDate();
    }, 200);
  }, [currentYear, currentMonthIndex]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID is missing in localStorage!");
      return;
    }
    fetchDietStats(selectedDate, userId);
    fetchRecomCal(userId);
    fetchCalorieDataForMonth(currentYear, currentMonthIndex, userId);
  }, [selectedDate, currentYear, currentMonthIndex]);

  const getDatesForMonth = (year, monthIndex) => {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, d) => {
      const dateObj = new Date(year, monthIndex, d + 1);
      return {
        date: d + 1,
        day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`,
      };
    });
  };

  const dates = getDatesForMonth(currentYear, currentMonthIndex);

  const changeMonth = async (direction) => {
    const newDate = new Date(currentYear, currentMonthIndex + direction);
    const newYear = newDate.getFullYear();
    const newMonthIndex = newDate.getMonth();

    setCurrentMonthIndex(newMonthIndex);
    setCurrentYear(newYear);

    const userId = localStorage.getItem("userId");
    if (userId) {
      await fetchCalorieDataForMonth(newYear, newMonthIndex, userId);
    }
  };

  const focusSelectedDate = () => {
    if (scrollRef.current) {
      const selectedElement = document.querySelector(".selected");
      if (selectedElement) {
        const containerWidth = scrollRef.current.offsetWidth;
        const selectedOffset = selectedElement.offsetLeft - containerWidth / 2 + selectedElement.offsetWidth / 2;
        scrollRef.current.scrollTo({ left: selectedOffset, behavior: "smooth" });
      }
    }
  };

  const fetchDietStats = async (date, userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diet/diet-stats?date=${date}&userId=${userId}`);
      if (response.data.success) {
        setDietStats(response.data.stats || { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFats: 0 });
      }
    } catch (error) {
      console.error("Error fetching diet stats:", error);
    }
  };

  const fetchRecomCal = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diet/recomcal?userId=${userId}`);
      if (response.data.success) {
        setRecomCal(response.data.recomCal);
      } else {
        setRecomCal(2000);
      }
    } catch (error) {
      console.error("Error fetching RecomCal:", error);
      setRecomCal(2000);
    }
  };

  const fetchCalorieDataForMonth = async (year, monthIndex, userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/diet/calorie-data?year=${year}&month=${monthIndex + 1}&userId=${userId}`
      );
      if (response.data.success) {
        setCalorieData(response.data.calorieData || {});
      }
    } catch (error) {
      console.error("Error fetching calorie data for the month:", error);
    }
  };

  const calorieDifference = recomCal ? dietStats.totalCalories - recomCal : 0;
  const dayStatusWord = calorieDifference > 0 ? "surplus" : "deficit";
  const dayStatusValue = Math.abs(calorieDifference);

  const caloriePercentage = recomCal ? Math.min((dietStats.totalCalories / recomCal) * 100, 100) : 0;

  return (
    <div className="diet-track">
      <AuthorNavbar />

      <div className="dietSummary">
        <div className="dietHeading">
          <span className="showDay">
            <div className="todayIcon"></div>
            {getDayLabel(selectedDate)}
          </span>
          <span>{selectedDate}</span>
        </div>

        <div className="progress-container">
          <motion.div
            className="progress-border"
            style={{ "--progress": 0 }}
            animate={{ "--progress": caloriePercentage }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          ></motion.div>
          <div className="calorie-box">
            <motion.span
              style={{ fontSize: "32px", display: "flex", alignItems: "center", flexDirection: "column", gap: "12px", color: "#5ba2fe" }}
              variants={popOutVariants}
              initial="hidden"
              animate="visible"
              transition={popOutTransition}
            >
              {dietStats.totalCalories}
              <span className="desc" style={{ fontSize: "12px", padding: "2px 12px", borderRadius: "4px", background: "#5ba2fe20" }}>
                Kcal
              </span>
            </motion.span>
            <span style={{ fontSize: "12px", fontWeight: "500", maxWidth: "100px" }}>
              You're in{" "}
              <strong
                style={{
                  fontSize: "16px",
                  color: dayStatusWord === "deficit" ? "#4CAF50" : "#FFA500",
                }}
              >
                {dayStatusWord}
              </strong>{" "}
              of{" "}
              <strong
                style={{
                  fontSize: "16px",
                  color: dayStatusWord === "deficit" ? "#4CAF50" : "#FFA500",
                }}
              >
                {dayStatusValue} Kcal
              </strong>
            </span>
          </div>
        </div>

        <div className="Macros">
          <motion.div
            className="carbs"
            variants={popOutVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...popOutTransition, delay: 0.4 }}
          >
            <span className="label">Carbs</span>
            <span className="value">{dietStats.totalCarbs} g</span>
          </motion.div>

          <motion.div
            className="protein"
            variants={popOutVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...popOutTransition, delay: 0.6 }}
          >
            <span className="label">Protein</span>
            <span className="value">{dietStats.totalProtein} g</span>
          </motion.div>

          <motion.div
            className="fats"
            variants={popOutVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...popOutTransition, delay: 0.8 }}
          >
            <span className="label">Fats</span>
            <span className="value">{dietStats.totalFats} g</span>
          </motion.div>
        </div>
        <div className="dietButtons">
          <button onClick={() => navigate("/log-diet")} className="checkButton">
            Log Diet
            <CirclePlus />
          </button>
          <button onClick={() => navigate("/diet-history")} className="checkButton">
            History
            <ListTodo />
          </button>
        </div>
      </div>

      <div className="calenderView">
        <div className="month-nav">
          <button className="toggleButton" onClick={() => changeMonth(-1)}>
            ❮
          </button>
          <h2 className="month-title">
            {new Date(currentYear, currentMonthIndex).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button className="toggleButton" onClick={() => changeMonth(1)}>
            ❯
          </button>
        </div>

        <div ref={scrollRef} className="date-container">
          {dates.map(({ fullDate, day, date }) => {
            const totalCalories = calorieData[fullDate] || 0;
            let dotColor = "";

            if (totalCalories > 0) {
              dotColor = totalCalories <= recomCal ? <Laugh /> : <Frown />;
            }

            return (
              <div
                key={fullDate}
                className={`date-box ${selectedDate === fullDate ? "selected" : ""}`}
                onClick={() => setSelectedDate(fullDate)}
              >
                <span className="day">{day}</span>
                <span className="date">{date}</span>
                {dotColor && <div style={{ color: "#5ba2fe" }}>{dotColor}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DietTrack;