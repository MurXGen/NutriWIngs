import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WorkoutTemplates from "../components/WorkoutTemplates";
import WorkoutHistory from "../components/WorkoutHistory";

const Workout = () => {


  return (
    <div className="workout-container">
      {/* Header */}
      <header className="header">
        <h2>Hey hi, John</h2>
        <p>Active, 20</p>
      </header>

      {/* Workout Summary */}
      <div className="summary">
        <div className="card">
          <h3>Today's Session</h3>

        </div>
        <div className="card">
          <h3>Calories Burned</h3>

        </div>
      </div>

      {/* Log Workout Buttons */}
      <div className="log-buttons">
        <Link to="/loglive-workout" className="btn">Log Live</Link>
        <Link to="/log-manual" className="btn">Log Manually</Link>
      </div>

      {/* Button to Go to Live Workout Page */}
      <div className="go-live-workout">
        <Link to="/loglive-workout" className="btn-live">Go to Live Workout</Link>
      </div>

      {/* Workout Metrics */}
      <div className="metrics">
        <h3>Workout Metrics</h3>
        <div className="progress-bar">
          <div className="progress" style={{ width: "37%" }}></div>
        </div>
      </div>

      {/* Past Workouts */}
      <h3>Your Past Workouts</h3>
      {/* past workout to be shown later */}

      {/* <WorkoutTemplates/> */}
      <WorkoutHistory />
    </div>
  );
};

export default Workout;
