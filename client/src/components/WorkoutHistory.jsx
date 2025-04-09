import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null); // index of the workout being edited

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workouts/workout-history", { withCredentials: true });
      setWorkouts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      setWorkouts([]);
    }
  };

  const formatDateWithSuffix = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const getOrdinalSuffix = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    const suffix = getOrdinalSuffix(day);
    return `${day}${suffix} ${month}, ${year} (${time})`;
  };

  const handleEditToggle = (parentIndex, childIndex) => {
    setEditingWorkout(`${parentIndex}-${childIndex}`);
  };

  const handleActionChange = (parentIndex, childIndex, key, field, value) => {
    const updated = [...workouts];
    updated[parentIndex].workouts[childIndex].actions[key][field] = value;
    setWorkouts(updated);
  };

  const handleUpdate = async (parentIndex, childIndex) => {
    const w = workouts[parentIndex];
    const workout = w.workouts[childIndex];
    try {
      await axios.put(
        "http://localhost:5000/api/workouts/update",
        {
          workoutName: workout.workoutName,
          actions: workout.actions,
          date: w.date,
        },
        { withCredentials: true }
      );
      setEditingWorkout(null);
    } catch (err) {
      console.error("Error updating workout:", err);
    }
  };

  const handleDeleteSet = async (parentIndex, childIndex, setKey) => {
    const w = workouts[parentIndex];
    const workout = w.workouts[childIndex];
    try {
      await axios.put(
        "http://localhost:5000/api/workouts/delete-single",
        {
          workout: {
            workoutName: workout.workoutName,
            date: w.date,
          },
          setKey,
        },
        { withCredentials: true }
      );

      const updated = [...workouts];
      delete updated[parentIndex].workouts[childIndex].actions[setKey];
      setWorkouts(updated);
    } catch (err) {
      console.error("Error deleting set:", err);
    }
  };

  // ✅ NEW: Delete Entire Workout Session
  const handleDeleteSession = async (date) => {
    try {
      await axios.delete("http://localhost:5000/api/workouts/delete-session", {
        data: { date },
        withCredentials: true,
      });

      // Remove from local state after deletion
      setWorkouts((prev) => prev.filter((w) => w.date !== date));
    } catch (error) {
      console.error("Error deleting workout session:", error);
    }
  };

  return (
    <div>
      <h2>Workout History</h2>
      {workouts.length === 0 ? (
        <p>No workout history available.</p>
      ) : (
        workouts.map((dayWorkout, parentIndex) => (
          <div key={parentIndex} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
            <p><strong>Date:</strong> {formatDateWithSuffix(dayWorkout.date)}</p>
            <p><strong>Duration:</strong> {dayWorkout.duration} seconds</p>

            {/* ✅ Add Delete Entire Session Button */}
            <button
              style={{ color: "red", marginBottom: "1rem" }}
              onClick={() => handleDeleteSession(dayWorkout.date)}
            >
              Delete Entire Session
            </button>

            {dayWorkout.workouts.map((workout, childIndex) => (
              <div key={childIndex} style={{ marginBottom: "1rem" }}>
                <h3>{workout.workoutName}</h3>
                <p>Category: {workout.category}</p>

                <h4>Actions:</h4>
                <ul>
                  {Object.entries(workout.actions || {}).map(([key, action], idx) => (
                    <li key={idx}>
                      {editingWorkout === `${parentIndex}-${childIndex}` ? (
                        <div>
                          Set {key}: 
                          Reps: 
                          <input
                            type="number"
                            value={action.reps}
                            onChange={(e) => handleActionChange(parentIndex, childIndex, key, "reps", e.target.value)}
                          />
                          Weight (kg): 
                          <input
                            type="number"
                            value={action.weight}
                            onChange={(e) => handleActionChange(parentIndex, childIndex, key, "weight", e.target.value)}
                          />
                          Failure: 
                          <input
                            type="text"
                            value={action.failure}
                            onChange={(e) => handleActionChange(parentIndex, childIndex, key, "failure", e.target.value)}
                          />
                          <button onClick={() => handleDeleteSet(parentIndex, childIndex, key)}>Delete Set</button>
                        </div>
                      ) : (
                        <>
                          Set {key}: {action.set} | Reps: {action.reps} | Weight: {action.weight}kg | Failure: {action.failure}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {editingWorkout === `${parentIndex}-${childIndex}` ? (
                  <button onClick={() => handleUpdate(parentIndex, childIndex)}>Update</button>
                ) : (
                  <button onClick={() => handleEditToggle(parentIndex, childIndex)}>Edit</button>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default WorkoutHistory;
