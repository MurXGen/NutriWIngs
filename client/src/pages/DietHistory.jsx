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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Get User ID from local storage or session
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
  
        const response = await fetch(`http://localhost:5000/api/diet/history?userId=${userId}`);
        
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
  

  const groupedDiets = history.reduce((acc, entry) => {
    if (!entry.Date) return acc; // Skip invalid entries

    const date = new Date(entry.Date).toLocaleDateString("en-CA");
    if (!acc[date]) {
      acc[date] = { totalCalories: 0, diets: [] };
    }
    acc[date].totalCalories += entry.DietTaken?.CaloriesTaken || 0;
    acc[date].diets.push(entry);
    return acc;
  }, {});

  const handleDateChange = (date) => {
    const selectedDateKey = date.toLocaleDateString("en-CA");
    setSelectedDate(selectedDateKey);
    setTotalCalories(groupedDiets[selectedDateKey]?.totalCalories || 0);

    const audio = new Audio(clickSound);
    audio.currentTime = 0; // Reset before playing
    audio.play();
  };

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonthBeforeToday = currentMonth <= today;

  if (loading) {
    return <div>Loading diet history...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <button onClick={() => navigate("/diet-tracker")}>Back</button>
      <h2>Diet History</h2>

      <div className="month-nav">
        <button onClick={() => handleMonthChange(-1)}>Previous</button>
        <span>{currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        {isCurrentMonthBeforeToday && <button onClick={() => handleMonthChange(1)}>Next</button>}
      </div>

      <motion.div className="calendar-grid" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
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

      {selectedDate && (
        <motion.div className="diet-details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginTop: "20px" }}>
          <h3>{selectedDate} - Total Calories: {totalCalories} kcal</h3>
          {groupedDiets[selectedDate]?.diets.map((entry) => (
            <motion.div key={entry.DietID} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} style={{ paddingLeft: "10px" }}>
              <p><strong>Food:</strong> {entry.FoodName}</p>
              <p><strong>Portion Taken:</strong> {entry.DietTaken?.PortionSizeTaken || 0} g</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DietHistory;
