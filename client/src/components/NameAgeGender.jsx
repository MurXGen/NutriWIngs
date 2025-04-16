import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mars, Venus, ChevronRight, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import LoginRedirect from "./LoginRedirect";

const NameAgeGender = ({ data, onChange, onNext }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState(data.day || "");
  const [selectedMonth, setSelectedMonth] = useState(data.month || "");
  const [selectedYear, setSelectedYear] = useState(data.year || "");
  const [age, setAge] = useState(data.age || ""); 

  
  const generateDays = (month, year) => {
    if (!month || !year) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const days = generateDays(selectedMonth, selectedYear);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1970 + i);

  
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
    if (selectedYear === currentYear && selectedMonth === currentMonth && selectedDay > currentDay) {
      setSelectedDay(currentDay);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  useEffect(() => {
    if (age !== "") {
      onChange("age", age);
    }
  }, [age]);


  
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      let calculatedAge = currentYear - selectedYear;

      if (selectedMonth > currentMonth || (selectedMonth === currentMonth && selectedDay > currentDay)) {
        calculatedAge -= 1;
      }

      setAge(calculatedAge);
    }
  }, [selectedDay, selectedMonth, selectedYear]);


  useEffect(() => {
    onChange("day", selectedDay);
    onChange("month", selectedMonth);
    onChange("year", selectedYear);
  }, [selectedDay, selectedMonth, selectedYear]);

  return (
    <motion.div
      className="RegisterComponent"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <div className="componentHeading">
        <User />
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Let's start with your details...
        </motion.h2>
      </div>

      <div className="nameInput">
        <label htmlFor="name">Enter Your Name</label>
        <motion.input
          type="text"
          placeholder="Name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <div className="dobSelection">
        <label htmlFor="dob">Select Your Date of Birth</label>
        <div className="dobInputs">
          {/* Year Selection */}
          <div className="dobVariable">
            <motion.select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </motion.select>
            <span>Year</span>
          </div>

          {/* Month Selection */}
          <div className="dobVariable">
            <motion.select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Month</option>
              {monthNames.map((monthName, index) => (
                <option key={index + 1} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </motion.select>
            <span>Month</span>
          </div>

          {/* Day Selection */}
          <div className="dobVariable">
            <motion.select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Day</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </motion.select>
            <span>Date</span>
          </div>
        </div>
      </div>

      {/* Display calculated age */}
      {age !== "" && (
        <motion.p className="ageDisplay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          You are <strong>{age} years old</strong>.
        </motion.p>
      )}

      <motion.div className="genderAction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <motion.div
          className={`genderBox ${data.gender === "Male" ? "selected" : ""}`}
          onClick={() => onChange("gender", "Male")}
        >
          <Mars />
          <span>Male</span>
        </motion.div>
        <motion.div
          className={`genderBox ${data.gender === "Female" ? "selected" : ""}`}
          onClick={() => onChange("gender", "Female")}
        >
          <Venus />
          <span>Female</span>
        </motion.div>
      </motion.div>

      <button className="proceed" onClick={() => {
        onNext();
      }}>
        Proceed <ChevronRight />
      </button>
      <LoginRedirect />
    </motion.div>
  );
};

export default NameAgeGender;
