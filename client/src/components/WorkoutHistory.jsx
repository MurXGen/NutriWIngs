import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workouts/workout-history", {
        withCredentials: true,
      });
      setWorkouts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      setWorkouts([]);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  const handleDeleteSession = async (date) => {
    try {
      await axios.delete("http://localhost:5000/api/workouts/delete-session", {
        data: { date },
        withCredentials: true,
      });
      setWorkouts((prev) => prev.filter((w) => w.date !== date));
    } catch (error) {
      console.error("Error deleting workout session:", error);
    }
  };

  return (
    <div className="workout-history-container">
      {workouts.length === 0 ? (
        <p className="no-history">No workout history available.</p>
      ) : (
        workouts.map((dayWorkout, parentIndex) => (
          <motion.div
            key={parentIndex}
            className="workout-session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="session-header">
              <div>
                <h3 className="session-date">{formatDate(dayWorkout.date)}</h3>
                <p className="session-duration">{formatDuration(dayWorkout.duration)}</p>
              </div>
              <button
                className="delete-session-btn"
                onClick={() => handleDeleteSession(dayWorkout.date)}
              >
                <X size={12} />
              </button>
            </div>

            {dayWorkout.workouts.map((workout, childIndex) => (
              <motion.div
                key={childIndex}
                className="workout-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="workout-header">
                  {workout.imageUrl && (
                    <div className="workout-image-preview">
                      <img
                        src={workout.imageUrl}
                        alt={workout.workoutName}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "block";
                        }}
                      />
                      <div className="image-fallback" style={{ display: "none" }}>
                        {workout.workoutName.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="workout-name">{workout.workoutName}</h3>
                    <p className="workout-category">{workout.category}</p>
                  </div>
                </div>

                <div className="workout-sets">
                  <span className="setLabel">Sets:</span>
                  <ul className="sets-list">
                    {Object.entries(workout.actions || {}).map(([key, action], idx) => (
                      <li key={idx} className="set-item">
                        {editingWorkout === `${parentIndex}-${childIndex}` ? (
                          <div className="edit-set-form">
                            <div className="form-group">
                              <label>Set {key}</label>
                              <div className="input-row">
                                <div>
                                  <span>Reps:</span>
                                  <input
                                    type="number"
                                    value={action.reps}
                                    onChange={(e) =>
                                      handleActionChange(parentIndex, childIndex, key, "reps", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <span>Weight (kg):</span>
                                  <input
                                    type="number"
                                    value={action.weight}
                                    onChange={(e) =>
                                      handleActionChange(parentIndex, childIndex, key, "weight", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <span>Failure:</span>
                                  <select
                                    value={action.failure}
                                    onChange={(e) =>
                                      handleActionChange(parentIndex, childIndex, key, "failure", e.target.value)
                                    }
                                  >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <button
                              className="delete-set-btn"
                              onClick={() => handleDeleteSet(parentIndex, childIndex, key)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="set-info">
                            <span className="set-number">Set {key}</span>
                            <span className="set-reps">{action.reps} reps</span>
                            <span className="set-weight">{action.weight} kg</span>
                            <span
                              className={`set-failure ${action.failure === "yes" ? "failure-yes" : ""}`}
                            >
                              {action.failure === "yes" ? "Failure" : "No failure"}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="workout-actions">
                  {editingWorkout === `${parentIndex}-${childIndex}` ? (
                    <button
                      className="update-btn"
                      onClick={() => handleUpdate(parentIndex, childIndex)}
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleEditToggle(parentIndex, childIndex)}
                    >
                      Edit Workout
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default WorkoutHistory;
