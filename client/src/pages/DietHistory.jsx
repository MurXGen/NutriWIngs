import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clickSound from "../assets/click.mp3";
import "../DietHistoryCalender.css";
import { useNavigate } from "react-router-dom";
import AuthorNavbar from '../components/AuthorNavbar'
import { Calendar, Edit, OctagonX } from "lucide-react";

const DietHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [recomCal, setRecomCal] = useState(2000);
  const [dailyCalories, setDailyCalories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found. Please log in again.");

       
        const response = await fetch(`https://nutriwings.onrender.com/api/diet/history?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch diet history");
        const data = await response.json();
        setHistory(data);

       
        const recomCalResponse = await fetch(`https://nutriwings.onrender.com/api/diet/recomcal?userId=${userId}`);
        if (recomCalResponse.ok) {
          const recomCalData = await recomCalResponse.json();
         
          console.log("Fetched RecomCal:", recomCalData);

          if (recomCalData.success) {
            setRecomCal(recomCalData.recomCal);
          } else {
            setRecomCal(2000);
          }
        } else {
          throw new Error("Failed to fetch RecomCal");
        }

       
        const dailyCal = {};
        data.forEach(entry => {
          if (!dailyCal[entry.Date]) {
            dailyCal[entry.Date] = 0;
          }
          dailyCal[entry.Date] += entry.DietTaken?.CaloriesTaken || 0;
        });
        setDailyCalories(dailyCal);

       
        const todayKey = new Date().toLocaleDateString("en-CA");
        setSelectedDate(todayKey);
        setTotalCalories(dailyCal[todayKey] || 0);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);


  const getDateColor = (dateKey) => {
    const calories = dailyCalories[dateKey] || 0;
    if (calories === 0) return '#5ba2fe20';
    if (calories > recomCal) return '#ff9966';
    if (calories < recomCal) return '#66cc99';
    return '#99ccff';
  };


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
    navigate(`/log-diet?dietId=${dietId}`);
  };

  const handleDelete = async (dietId) => {
    const userId = localStorage.getItem("userId");
    if (!userId || !dietId) return;

    try {
     
      const res = await fetch(`https://nutriwings.onrender.com/api/diet/delete/${userId}/${dietId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete diet entry");

     
      const updatedResponse = await fetch(`https://nutriwings.onrender.com/api/diet/history?userId=${userId}`);
      if (!updatedResponse.ok) throw new Error("Failed to fetch updated diet history");

      const updatedData = await updatedResponse.json();
      setHistory(updatedData);

     
      if (selectedDate) {
        const total = updatedData
          .filter((entry) => entry.Date === selectedDate)
          .reduce((sum, entry) => sum + (entry.DietTaken?.CaloriesTaken || 0), 0);
        setTotalCalories(total);
      }

    } catch (error) {
      console.error("Error deleting diet entry:", error);
    }
  };



  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
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
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <div className="monthNav">
          <button onClick={() => handleMonthChange(-1)}>{"<"}</button>
          <span className="monthText" style={{ cursor: "pointer", fontWeight: "bold" }}>
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          {isCurrentMonthBeforeToday && <button onClick={() => handleMonthChange(1)}>{">"}</button>}
        </div>
        <span className="monthArrow" onClick={() => setShowCalendar((prev) => !prev)}>↓</span>
      </div>

      {/* Sliding Calendar View */}
      <motion.div className="calenderView" initial={{ height: 0, opacity: 0 }} animate={{ height: showCalendar ? 0 : "auto", opacity: showCalendar ? 0 : 1 }} transition={{ duration: 0.5 }} style={{ overflow: "hidden" }}>

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
            const dateColor = getDateColor(dateKey);
            const isSelected = selectedDate === dateKey;

            return (
              <motion.button
                key={dateKey}
                onClick={() => isPastOrToday && handleDateChange(date)}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: isSelected ? "rgb(91, 162, 254)" : dateColor,
                  color: isSelected ? "white" : "black",
                  border: isSelected ? "2px solid white" : "none",
                  cursor: isPastOrToday ? "pointer" : "not-allowed",
                  fontSize: '12px',
                  placeItems: 'center',
                  margin: '2px'
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
      {selectedDate && (
        <motion.div
          className="diet-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: "20px" }}
        >
          <span className="dietHistoryLabel">
            <span className="calorieDate"><Calendar color="#5ba2fe" size={16} />{selectedDate}</span>
            <span className="caloreValue">{totalCalories.toFixed(1)} kcal</span>
          </span>

          {history
            .filter((entry) => entry.Date === selectedDate)
            .map((entry) => (
              <motion.div
                key={entry.DietID}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="dietList"
              >
                <div className="dietListImg">
                  {entry.ImageUrl && (
                    <img
                      src={entry.ImageUrl}
                      alt={entry.FoodName}
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }}
                    />
                  )}
                </div>

                <div className="dietListContent">
                  <div className="foodName">
                    <span><strong>Food :</strong> {entry.FoodName}</span>
                    <span style={{ fontSize: '12px' }}>{entry.DietTaken?.PortionSizeTaken?.toFixed(1) || "0"} g</span>
                  </div>
                  <div className="foodNutritions">
                    <span><strong style={{ color: "rgb(188 169 0)" }}>Carbs:</strong> {entry.DietTaken?.Carbs?.toFixed(1) || "0"} g</span>
                    <span><strong style={{ color: "rgb(0 157 5)" }}>Protein:</strong> {entry.DietTaken?.Protein?.toFixed(1) || "0"} g</span>
                    <span><strong style={{ color: "#FF8192" }}>Fats:</strong> {entry.DietTaken?.Fats?.toFixed(1) || "0"} g</span>
                  </div>

                </div>
                <div className="actionButtons">
                  <button
                    onClick={() => handleEdit(entry.DietID)}
                  >
                    <Edit color="#5ba2fe" size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(entry.DietID)}
                  >
                    <OctagonX color="#5ba2fe" size={16} />
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
