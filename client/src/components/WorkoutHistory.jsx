import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/workouts/workout-history", { withCredentials: true });


        // Ensure response.data is an array
        setWorkouts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching workout history:", error);
        setWorkouts([]); // Set empty array on error
      }
    };

    fetchWorkoutHistory();
  }, []);

  return (
    <div>
      <h2>Workout History</h2>
      {workouts.length === 0 ? (
        <p>No workout history available.</p>
      ) : (
        <ul>
          {workouts.map((workout, index) => (
            <li key={index}>
              <h3>{workout.workoutName}</h3>
              <p>Category: {workout.category}</p>
              <p>Duration: {workout.duration} seconds</p>
              <p>Date: {new Date(workout.date).toLocaleDateString()}</p>
              <h4>Actions:</h4>
              <ul>
                {Object.entries(workout.actions || {}).map(([key, action], idx) => (
                  <li key={idx}>
                    Set {key}: {action.set} | Reps: {action.reps} | Weight: {action.weight}kg | Failure: {action.failure}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkoutHistory;
