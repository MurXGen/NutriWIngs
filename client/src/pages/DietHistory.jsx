import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clickSound from "../assets/click.mp3";
import "../DietHistoryCalender.css";
import { useNavigate } from "react-router-dom";
import AuthorNavbar from '../components/AuthorNavbar'

const DietHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found. Please log in again.");

        const response = await fetch(`http://localhost:5000/api/diet/history?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch diet history");

        const data = await response.json();
        setHistory(data);

        const todayKey = new Date().toLocaleDateString("en-CA");
        if (data.some((entry) => entry.Date === todayKey)) {
          setSelectedDate(todayKey);
          setTotalCalories(
            data
              .filter((entry) => entry.Date === todayKey)
              .reduce((sum, entry) => sum + (entry.DietTaken?.CaloriesTaken || 0), 0)
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const handleDateChange = (date) => {
    const selectedDateKey = date.toLocaleDateString("en-CA");
    setSelectedDate(selectedDateKey);
    setTotalCalories(
      history.reduce((sum, entry) => (entry.Date === selectedDateKey ? sum + (entry.DietTaken?.CaloriesTaken || 0) : sum), 0)
    );

    const audio = new Audio(clickSound);
    audio.play();
  
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 1000);
  };

  const handleEdit = (dietId) => {
    if (!dietId) return;
    navigate(`/log-diet?dietId=${dietId}`); // Pass dietId as query param
  };
  

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 for Sun, 1 for Mon...
  const today = new Date();
  const isCurrentMonthBeforeToday = currentMonth <= today;

  if (loading) return <div>Loading diet history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    
    <motion.div className="dietHistory" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <div className="pageNavigation">

      <button onClick={() => navigate("/diet-tracker")}>{"<"}</button>
      <span>Diet History</span>

              
      </div>

      {/* Month Navigation */}
      <div style={{display:'flex',gap:'12px',flexDirection:'column'}} onClick={() => setShowCalendar((prev) => !prev)}>
        <div  className="monthNav">
        <button onClick={() => handleMonthChange(-1)}>{"<"}</button>
        <span className="monthText" style={{ cursor: "pointer", fontWeight: "bold" }}>
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        {isCurrentMonthBeforeToday && <button onClick={() => handleMonthChange(1)}>{">"}</button>}
        </div>
        <span className="monthArrow">↓</span>
      </div>

      {/* Sliding Calendar View */}
      <motion.div className="calenderView" initial={{ height: 0, opacity: 0 }} animate={{ height: showCalendar ? "auto" : 0, opacity: showCalendar ? 1 : 0 }} transition={{ duration: 0.5 }} style={{ overflow: "hidden" }}>
        
        {/* Days of the week header */}
        <div className="daysHeader">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="day-name">{day}</span>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="calendar-grid">
          {/* Empty slots for alignment before the first date */}
          {Array(firstDayIndex).fill(null).map((_, index) => (
            <span key={`empty-${index}`} className="empty-date"></span>
          ))}

          {/* Dates of the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
            const dateKey = date.toLocaleDateString("en-CA");
            const isPastOrToday = date <= today;

            return (
              <motion.button
                key={dateKey}
                onClick={() => isPastOrToday && handleDateChange(date)}
                whileTap={{ scale: 0.9, backgroundColor: "#5ba2fe10" }}
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: selectedDate === dateKey ? "rgb(91, 162, 254)" : "#5ba2fe21",
                  color: selectedDate === dateKey ? "white" : "black",
                  border: "none",
                  cursor: isPastOrToday ? "pointer" : "not-allowed",
                  fontSize:'12px',
                  placeItems:'center'
                }}
                disabled={!isPastOrToday}
              >
                {index + 1}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Diet Details */}
     {/* Diet Details */}
     {selectedDate && (
  <motion.div 
    className="diet-details" 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }} 
    style={{ marginTop: "20px" }}
  >
    <h3>{selectedDate} - Total Calories: {totalCalories.toFixed(1)} kcal</h3>

    {history
  .filter((entry) => entry.Date === selectedDate)
  .map((entry) => (
    <motion.div 
      key={entry.DietID} 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.3, delay: 0.1 }} 
      style={{ padding: "10px", borderBottom: "1px solid #ddd", position: "relative" }}
    >
      <p><strong>Food:</strong> {entry.FoodName}</p>
      <p><strong>Portion Taken:</strong> {entry.DietTaken?.PortionSizeTaken?.toFixed(1) || "0"} g</p>
      <p><strong>Carbs:</strong> {entry.DietTaken?.Carbs?.toFixed(1) || "0"} g</p>
      <p><strong>Protein:</strong> {entry.DietTaken?.Protein?.toFixed(1) || "0"} g</p>
      <p><strong>Fats:</strong> {entry.DietTaken?.Fats?.toFixed(1) || "0"} g</p>

      {/* Display Image if Available */}
      {entry.ImageUrl && (
        <img 
          src={entry.ImageUrl} 
          alt={entry.FoodName} 
          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }}
        />
      )}

      {/* Edit and Delete Buttons */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button 
          onClick={() => handleEdit(entry.DietID)} 
          style={{ background: "#5ba2fe", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Edit
        </button>
        
        <button 
          onClick={() => handleDelete(entry.DietID)} 
          style={{ background: "#ff4d4d", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  ))}

  </motion.div>
)}


    </motion.div>
  );
};

export default DietHistory;
