import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const WorkoutTemplates = () => {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_KEY = "8475311212msh7e0f4801aeee83cp189f89jsnd728e30a048c";

 
  const fetchWorkouts = useCallback(async (retryCount = 3) => {
    setLoading(true);
    setError(null);

    const url =
      category === "All"
        ? "https://exercisedb.p.rapidapi.com/exercises?limit=50"
        : `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${category}?limit=50`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      });

      if (response.status === 429 && retryCount > 0) {
        console.warn("Too many requests, retrying in 3 seconds...");
        setTimeout(() => fetchWorkouts(retryCount - 1));
        return;
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format from API");

      setWorkouts(data);
      setFilteredWorkouts(data.slice(0, 10));
      localStorage.setItem(`workouts_${category}`, JSON.stringify(data));
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

 
  useEffect(() => {
    const cachedData = localStorage.getItem(`workouts_${category}`);
    if (cachedData) {
      setWorkouts(JSON.parse(cachedData));
      setFilteredWorkouts(JSON.parse(cachedData).slice(0, 10));
    } else {
      fetchWorkouts();
    }
  }, [category, fetchWorkouts]);

 
  useEffect(() => {
    if (workouts.length === 0) return;

    let filtered = workouts;
    if (searchTerm.length >= 3) {
      filtered = filtered.filter((workout) =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWorkouts(filtered.slice(0, visibleCount));
  }, [searchTerm, visibleCount, workouts]);

  const categories = useMemo(
    () => [
      "All",
      "Back",
      "Cardio",
      "Chest",
      "Lower Arms",
      "Lower Legs",
      "Neck",
      "Shoulders",
      "Upper Arms",
      "Upper Legs",
      "Waist",
    ],
    []
  );

  return (
    <div className="workoutTemplates">
      {/* Page Navigation */}
      <div className="pageNavigation">
        <button onClick={() => navigate("/")}>{"<"}</button>
        <span>Log Diet Live</span>
      </div>

      {/* Search Input */}
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
        />
      </div>

      {/* Scrollable Categories */}
      <div className="categoryContainer">
        {categories.map((cat) => (
          <span
            key={cat}
            className={`categoryItem ${category === cat ? "active" : ""}`}
            onClick={() => {
              setCategory(cat);
              setVisibleCount(10);
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Show Error Message */}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* Loading Indicator */}
      {loading && <p style={{ textAlign: "center" }}>Loading exercises...</p>}

      {/* Workout List with Framer Motion Fade-in */}
      <motion.div
        className="workout-list"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <motion.div
              key={workout.id}
              className="workout-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <img src={workout.gifUrl} alt={workout.name} />
              <span>{workout.name.length > 24 ? workout.name.substring(0, 24) + "..." : workout.name}</span>
              <span style={{ background: "#5BA2FE" }}>{workout.bodyPart}</span>
            </motion.div>
          ))
        ) : (
          !loading && <p style={{ textAlign: "center" }}>No workouts found.</p>
        )}
      </motion.div>

      {/* Show More Button */}
      {filteredWorkouts.length >= visibleCount && (
        <motion.button
          style={{ marginTop: "12px", width: "100%" }}
          onClick={() => setVisibleCount(visibleCount + 10)}
          className="toggleButton"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Show More
        </motion.button>
      )}
    </div>
  );
};

export default WorkoutTemplates;
