import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkoutTemplates from "../components/WorkoutTemplates";
import WorkoutHistory from "../components/WorkoutHistory";
import BottomNavBar from "../components/BottomNavBar";
import AuthorNavbar from "../components/AuthorNavbar";
import { MoveRight, History } from "lucide-react";

const Workout = () => {
  const navigate = useNavigate();

  return (
    <div className="workoutContainer">
      <AuthorNavbar />
      <div className="actionButtons">
        <button onClick={() => navigate("/loglive-workout")}>Log Workout<MoveRight /></button>
        <button onClick={() => navigate("/workout-history")}>History<History /></button>
      </div>
      <h2 className="history-header">Recent Workouts</h2>

      <WorkoutHistory />
      <BottomNavBar />
    </div>
  );
};

export default Workout;
