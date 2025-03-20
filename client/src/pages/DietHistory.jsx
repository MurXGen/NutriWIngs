import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clickSound from "../assets/click.mp3";
import "../DietHistoryCalender.css";
import { useNavigate } from "react-router-dom";

const DietHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch diet history from the API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/diet/history");
        if (!response.ok) {
          throw new Error("Failed to fetch diet history");
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Group diets by date
  const groupedDiets = history.reduce((acc, entry) => {
    const date = new Date(entry.Date).toLocaleDateString("en-CA");
    if (!acc[date]) {
      acc[date] = { totalCalories: 0, diets: [] };
    }
    acc[date].totalCalories += entry.DietTaken?.CaloriesTaken || 0;
    acc[date].diets.push(entry);
    return acc;
  }, {});

  // Handle date selection
  const handleDateChange = (date) => {
    const selectedDateKey = date.toLocaleDateString("en-CA");
    setSelectedDate(selectedDateKey);
    setTotalCalories(groupedDiets[selectedDateKey]?.totalCalories || 0);

    // Play click sound for 1 second
    const audio = new Audio(clickSound);
    audio.play();
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // Reset audio
    }, 1000);
  };

  // Handle month navigation
  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // Get the number of days in the current month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const today = new Date();

  // Render loading or error state
  if (loading) {
    return <div>Loading diet history...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <button onClick={() => navigate("/diet-tracker")}>Back</button>
      <h2>Diet History</h2>

      {/* Month Navigation */}
      <div className="month-nav">
        <button onClick={() => handleMonthChange(-1)}>Previous</button>
        <span>{currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        {currentMonth < today && <button onClick={() => handleMonthChange(1)}>Next</button>}
      </div>

      {/* Calendar Grid */}
      <motion.div
        className="calendar-grid"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[...Array(daysInMonth)].map((_, index) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
          const dateKey = date.toLocaleDateString("en-CA");
          const isPastOrToday = date <= today;
          const isOverLimit = groupedDiets[dateKey]?.totalCalories > 2000;

          return (
            <motion.button
              key={dateKey}
              onClick={() => isPastOrToday && handleDateChange(date)}
              whileTap={{ scale: 0.9, backgroundColor: "rgba(173, 216, 230, 0.7)" }}
              style={{
                padding: "12px",
                borderRadius: "50%",
                backgroundColor: selectedDate === dateKey ? "#4a90e2" : isOverLimit ? "red" : "white",
                color: selectedDate === dateKey ? "white" : "black",
                border: "2px solid black",
                cursor: isPastOrToday ? "pointer" : "not-allowed",
                position: "relative",
                overflow: "hidden",
              }}
              disabled={!isPastOrToday}
            >
              {index + 1}
              {/* Water Ripple Effect */}
              {selectedDate === dateKey && (
                <motion.div
                  className="ripple"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "60px",
                    height: "60px",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Diet Details Animation */}
      {selectedDate && (
        <motion.div
          className="diet-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: "20px" }}
        >
          <h3>{selectedDate} - Total Calories: {totalCalories} kcal</h3>
          {groupedDiets[selectedDate]?.diets.map((entry) => (
            <motion.div
              key={entry.DietID}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ paddingLeft: "10px" }}
            >
              <p><strong>Food:</strong> {entry.FoodName}</p>
              <p><strong>Portion Taken:</strong> {entry.DietTaken?.PortionSizeTaken || 0} g</p>
              <p><strong>Calories Taken:</strong> {entry.DietTaken?.CaloriesTaken || 0} kcal</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DietHistory;