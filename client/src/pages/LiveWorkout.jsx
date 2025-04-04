import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from 'framer-motion';
import Abs from '../assets/workout/abs.gif'
import { Play, CircleStop, Pause, CirclePlus, Info } from 'lucide-react'

const LiveWorkout = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [workoutMode, setWorkoutMode] = useState(null); // "timer" or "manual"
  const [duration, setDuration] = useState(""); // Store manual duration
  const [error, setError] = useState("");

  const [currentWorkouts, setCurrentWorkouts] = useState([
    {
      id: Date.now(),
      workoutName: "",
      imageUrl: "",
      category: "",
      actions: {},
      currentSet: 1,
      currentReps: "",
      currentWeight: "",
      currentFailure: "no"
    }
  ]);
  const [workoutCount, setWorkoutCount] = useState(1);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
    setIsPaused(false);
    // Update start time for all current workouts
    setCurrentWorkouts(prev =>
      prev.map(workout => ({
        ...workout,
        startTime: new Date().toISOString()
      }))
    );
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    for (let workout of currentWorkouts) {
        // 🚨 Save the latest set before validation 🚨
        if (workout.currentReps || workout.currentWeight) {
            workout.actions[workout.currentSet] = {
                reps: workout.currentReps,
                weight: workout.currentWeight,
                failure: workout.currentFailure,
            };
        }

        // 🚨 Validate input fields before stopping 🚨
        if (!workout.workoutName.trim()) {
            setError("Please enter a Workout Name before stopping.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        if (!workout.category.trim()) {
            setError("Please select a Workout Category before stopping.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        if (Object.keys(workout.actions).length === 0) {
            setError(`Please add at least one set for ${workout.workoutName}.`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        for (let setNumber in workout.actions) {
            const set = workout.actions[setNumber];

            if (!set.reps || isNaN(set.reps) || parseInt(set.reps) <= 0) {
                setError(`Please enter a valid number of reps for Set ${setNumber} in ${workout.workoutName}.`);
                setTimeout(() => setError(""), 3000);
                return;
            }

            if (!set.weight || isNaN(set.weight) || parseFloat(set.weight) <= 0) {
                setError(`Please enter a valid weight for Set ${setNumber} in ${workout.workoutName}.`);
                setTimeout(() => setError(""), 3000);
                return;
            }
        }
    }

    // ✅ If all validations pass, proceed to save workout  
    setHasStarted(false);
    setIsRunning(false);
    setIsPaused(false);

    const completedWorkouts = currentWorkouts.map(workout => ({
        ...workout,
        duration: timer,
    }));

    setWorkouts(prev => [...prev, ...completedWorkouts]);
    setCurrentWorkouts([{ // Reset state
        id: Date.now(),
        workoutName: "",
        imageUrl: "",
        category: "",
        actions: {},
        currentSet: 1,
        currentReps: "",
        currentWeight: "",
        currentFailure: "no"
    }]);
    setWorkoutCount(1);
    setTimer(0);

    try {
        const response = await fetch("http://localhost:5000/api/workouts/save-workout", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ workouts: completedWorkouts }),
        });

        const data = await response.json();
        console.log("Workout saved:", data);

        // Show success popup
        setPopupMessage("Workout saved successfully! 🎉");
        setShowSuccessPopup(true);

        // Auto-hide popup and then redirect
        setTimeout(() => {
            setShowSuccessPopup(false);
            navigate("/workout");
        }, 1000);
    } catch (error) {
        console.error("Error saving workout:", error);
        setError("Failed to save workout 😢");
        setTimeout(() => setError(""), 3000);
    }
};


  

  const handleAddWorkout = () => {
    setCurrentWorkouts(prev => [
      ...prev,
      {
        id: Date.now(),
        workoutName: "",
        imageUrl: "",
        category: "",
        actions: {},
        currentSet: 1,
        currentReps: "",
        currentWeight: "",
        currentFailure: "no"
      }
    ]);
    setWorkoutCount(prev => prev + 1);
  };

  const handleRemoveWorkout = (id) => {
    if (currentWorkouts.length === 1) {
      // Don't remove the last workout card
      return;
    }
    setCurrentWorkouts(prev => prev.filter(workout => workout.id !== id));
    setWorkoutCount(prev => prev - 1);
  };

  const handleRemoveSet = (workoutId, setNumber) => {
    setCurrentWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          const newActions = { ...workout.actions };
          delete newActions[setNumber];

          // Re-sequence the sets
          const actionKeys = Object.keys(newActions)
            .map(Number)
            .sort((a, b) => a - b);

          const resequencedActions = {};
          actionKeys.forEach((key, index) => {
            const newKey = index + 1;
            resequencedActions[newKey] = {
              ...newActions[key],
              set: newKey
            };
          });

          // Determine if we need to adjust currentSet
          let newCurrentSet = workout.currentSet;
          if (setNumber < workout.currentSet) {
            newCurrentSet = Math.max(1, workout.currentSet - 1);
          } else if (setNumber === workout.currentSet) {
            newCurrentSet = Math.max(1, workout.currentSet - 1);
          }

          return {
            ...workout,
            actions: resequencedActions,
            currentSet: newCurrentSet
          };
        }
        return workout;
      })
    );
  };

  const handleAddSet = (workoutId) => {
    setCurrentWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          // Save the data of the current set before moving forward
          const updatedActions = {
            ...workout.actions,
            [workout.currentSet]: {
              reps: workout.currentReps || workout.actions[workout.currentSet]?.reps || "",
              weight: workout.currentWeight || workout.actions[workout.currentSet]?.weight || "",
              failure: workout.currentFailure || workout.actions[workout.currentSet]?.failure || "no",
            }
          };

          return {
            ...workout,
            actions: updatedActions,
            currentSet: workout.currentSet + 1,
            currentReps: "",
            currentWeight: "",
            currentFailure: "no"
          };
        }
        return workout;
      })
    );
  };


  const handleSetClick = (workoutId, setNumber) => {
    setCurrentWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          // Save the current set's data first
          const updatedActions = {
            ...workout.actions,
            [workout.currentSet]: {
              reps: workout.currentReps || workout.actions[workout.currentSet]?.reps || "",
              weight: workout.currentWeight || workout.actions[workout.currentSet]?.weight || "",
              failure: workout.currentFailure || workout.actions[workout.currentSet]?.failure || "no",
            }
          };

          // Now switch to the selected set and load its data
          const selectedSet = updatedActions[setNumber] || {
            reps: "",
            weight: "",
            failure: "no"
          };

          return {
            ...workout,
            actions: updatedActions,
            currentSet: setNumber,
            currentReps: selectedSet.reps,
            currentWeight: selectedSet.weight,
            currentFailure: selectedSet.failure
          };
        }
        return workout;
      })
    );
  };


  const handleWorkoutChange = (workoutId, field, value) => {
    setCurrentWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            [field]: value
          };
        }
        return workout;
      })
    );
  };

  const handleInputChange = (workoutId, field, value) => {
    setCurrentWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          // Save the current input immediately into the actions object
          const updatedActions = {
            ...workout.actions,
            [workout.currentSet]: {
              reps: field === "currentReps" ? value : workout.actions[workout.currentSet]?.reps || "",
              weight: field === "currentWeight" ? value : workout.actions[workout.currentSet]?.weight || "",
              failure: field === "currentFailure" ? value : workout.actions[workout.currentSet]?.failure || "no",
            }
          };

          return {
            ...workout,
            [field]: value, // Update UI state for the input
            actions: updatedActions, // Ensure Set 1 data is stored live
          };
        }
        return workout;
      })
    );
  };




  return (
    <div className={`workoutLive ${!workoutMode ? "blurredBackground" : ""}`}>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="errorText"
          style={{
            background: "white",
            padding: "12px",
            position: "fixed",
            top: "24px",
            fontSize: "14px",
            display: "flex",
            alignItems: "start",
            gap: "12px",
            color: "red",
            border: "1px solid red",
            borderRadius: "12px",
            width: "80%",
            zIndex: '1',
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Info />
          {error}
        </motion.div>
      )}



      <div className="pageNavigation">
        <button onClick={() => navigate("/")}>{"<"}</button>
        <span>Log Diet Live</span>
      </div>
      {!workoutMode && (
        <div className="modeSelection">
          <span className="labelForSelection">
            Select Duration Type
          </span>
          <div className="modeButtons">


            <button onClick={() => setWorkoutMode("timer")}>Timer-Based</button>
            <button onClick={() => setWorkoutMode("manual")}>Manual-Based</button>
          </div>
          <Link to="/workout" style={{ color: '#5ba2fe', fontSize: '12px', letterSpacing: '1px', background: '#5ba2fe20', padding: "12px 24px", borderRadius: '20px' }}>I'll Log Later...</Link>
        </div>
      )}



      {/* If Timer-Based is selected, show the workout timer */}
      <div className="mainContent">
        {workoutMode === "timer" && (
          <div className="timerDuration">
            <div className="timerActions">
              {!hasStarted ? (
                <button onClick={handleStart}>Start <Play size="16px" color="#5ba2fe" /></button>
              ) : (
                <div className="showAfterStart">
                  <button onClick={handleStop}>Stop <CircleStop size="16px" color="#5ba2fe" /></button>
                  {!isPaused ? (
                    <button onClick={handlePause}>Pause <Pause size="16px" color="#5ba2fe" /></button>
                  ) : (
                    <button onClick={handleResume}>Resume <Play size="16px" color="#5ba2fe" /></button>
                  )}
                </div>
              )}
            </div>
            <div className="timerCount">
              <span>{String(Math.floor(timer / 60)).padStart(2, "0")} m</span>
              <span>{String(timer % 60).padStart(2, "0")} s</span>
            </div>
          </div>
        )}

        {workoutMode === "manual" && (
          <div className="manualDuration">
            <label>Enter Workout Duration (in minutes):</label>
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <button onClick={handleStop} className="">Save </button>
          </div>
        )}


        <div className="workoutContainer">
          <div className="addActions">
            <button className="toggleButton" onClick={handleAddWorkout}>Add Workout</button>
            <div className="showWorkout">
              <span>{workoutCount} Workout{workoutCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="workoutCards">
            {currentWorkouts.map((workout) => (
              <div key={workout.id} className="workoutCard">
                <button
                  className="cancelWorkout"
                  onClick={() => handleRemoveWorkout(workout.id)}
                  disabled={currentWorkouts.length === 1}
                >
                  ×
                </button>
                <div className="workoutImg">
                  <img src={Abs} alt="Workout demonstration" />
                </div>
                <div className="workoutForm">
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Workout Name"
                      value={workout.workoutName}
                      onChange={(e) => handleWorkoutChange(workout.id, 'workoutName', e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={workout.category}
                      onChange={(e) => handleWorkoutChange(workout.id, 'category', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="workoutSet">
                    <div className="sets">
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>Sets</span>
                      <div className="set">
                        {Object.keys(workout.actions)
                          .map(Number)
                          .sort((a, b) => a - b)
                          .map(set => (
                            <React.Fragment key={set}>
                              <span
                                className={workout.currentSet === set ? "selectedSet" : "notSelectedSet"}
                                onClick={() => handleSetClick(workout.id, set)}
                              >
                                {set}<button
                                  className="removeSet"
                                  onClick={() => handleRemoveSet(workout.id, set)}
                                >
                                  ×
                                </button>
                              </span>


                            </React.Fragment>
                          ))
                        }
                        {workout.currentSet > Object.keys(workout.actions).length && (
                          <span className="selectedSet">
                            {workout.currentSet}
                          </span>
                        )}
                        <button onClick={() => handleAddSet(workout.id)} style={{ border: '0', background: '#5ba2fe20', borderRadius: '50px', display: 'flex', alignItems: 'center', padding: '0 12px' }}

                        ><CirclePlus size='16px' color="#5ba2fe" /></button>


                      </div>
                    </div>
                    <div className="reps">
                      <input
                        type="text"
                        className="rep"
                        placeholder="Reps"
                        value={workout.currentReps}
                        onChange={(e) => handleInputChange(workout.id, 'currentReps', e.target.value)}
                        required
                      />
                    </div>
                    <div className="weights">
                      <input
                        type="text"
                        className="weight"
                        placeholder="Weight"
                        value={workout.currentWeight}
                        onChange={(e) => handleInputChange(workout.id, 'currentWeight', e.target.value)}
                        required
                      />
                    </div>
                    <div className="failure">
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>Failure</span>
                      <div>

                        <input
                          type="radio"
                          name={`failure-${workout.id}`}
                          value="yes"
                          checked={workout.currentFailure === "yes"}
                          onChange={() => handleInputChange(workout.id, 'currentFailure', "yes")}
                        /> Yes
                        <input
                          type="radio"
                          name={`failure-${workout.id}`}
                          value="no"
                          checked={workout.currentFailure === "no"}
                          onChange={() => handleInputChange(workout.id, 'currentFailure', "no")}
                        /> No

                      </div>
                    </div>


                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>



      {showSuccessPopup && (
        <div className="popUpMessage">
          Data Saved
        </div>
      )}

    </div>

  );
};

export default LiveWorkout;