import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../DietHistoryCalender.css"; // Custom styles for red highlight

const DietHistoryCalendar = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch("https://nutriwings.onrender.com/api/diet/history");
      const data = await response.json();
      if (response.ok) setHistory(data);
    };
    fetchHistory();
  }, []);

  // Group by date and calculate total calories per day
  const groupedDiets = history.reduce((acc, entry) => {
    const formattedDate = entry.Date && entry.Time
      ? new Date(`${entry.Date}T${entry.Time}`).toISOString().split("T")[0]
      : "Date Not Available";

    if (!acc[formattedDate]) {
      acc[formattedDate] = { totalCalories: 0 };
    }

    acc[formattedDate].totalCalories += entry.DietTaken?.CaloriesTaken || 0;
    return acc;
  }, {});

  // Handle date selection
  const handleDateChange = (date) => {
    // Format to YYYY-MM-DD (avoiding timezone issues)
    const selectedDateKey = date.toLocaleDateString("en-CA"); 
  
    setSelectedDate(selectedDateKey);
    setTotalCalories(groupedDiets[selectedDateKey]?.totalCalories || 0);
  };
  
  

  return (
    <div>
      <h2>Diet History Calendar</h2>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate ? new Date(selectedDate) : new Date()}
        maxDate={new Date()} // Disable future dates
        tileClassName={({ date }) => {
          const dateKey = date.toISOString().split("T")[0];
          return groupedDiets[dateKey]?.totalCalories > 2000 ? "high-calories" : "";
        }}
      />

      {selectedDate && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
          <h3>
            {selectedDate} - Total Calories: {totalCalories} kcal
          </h3>
        </div>
      )}
    </div>
  );
};

export default DietHistoryCalendar;
