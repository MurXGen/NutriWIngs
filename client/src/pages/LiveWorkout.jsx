import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import Abs from '../assets/workout/abs.gif'
import { Play, CircleStop, Pause, CirclePlus } from 'lucide-react'

const LiveWorkout = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
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
    setHasStarted(false);
    setIsRunning(false);
    setIsPaused(false);

    const completedWorkouts = currentWorkouts.map(workout => ({
      ...workout,
      duration: timer,
    }));

    setWorkouts(prev => [...prev, ...completedWorkouts]);
    setCurrentWorkouts([/* ... reset data ... */]);
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

      // Auto-hide after 3 seconds
      setTimeout(() => setShowSuccessPopup(false), 3000);

    } catch (error) {
      console.error("Error saving workout:", error);
      setPopupMessage("Failed to save workout 😢");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
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
          // Save current set data before moving to next set
          const newActions = {
            ...workout.actions,
            [workout.currentSet]: {
              set: workout.currentSet,
              reps: workout.currentReps,
              weight: workout.currentWeight,
              failure: workout.currentFailure
            }
          };

          return {
            ...workout,
            actions: newActions,
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
          // First, save the current set data before switching
          const currentSetData = {
            reps: workout.currentReps,
            weight: workout.currentWeight,
            failure: workout.currentFailure
          };

          const updatedActions = {
            ...workout.actions,
            [workout.currentSet]: workout.currentSet in workout.actions ? {
              ...workout.actions[workout.currentSet],
              ...currentSetData
            } : currentSetData
          };

          // Now load the clicked set's data
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
          return {
            ...workout,
            [field]: value
          };
        }
        return workout;
      })
    );
  };



  return (
    <div className="workoutLive">
      <div className="addActions">
        <button className="toggleButton" onClick={handleAddWorkout}>Add Workout</button>
        <div className="showWorkout">
          <span>{workoutCount} Workout{workoutCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {/* Page Navigation */}
      <div className="pageNavigation">
        <button onClick={() => navigate("/")}>{"<"}</button>
        <span>Log Diet Live</span>
      </div>

      {/* Timer Section */}
      <div className="timerDuration">
        <div className="timerActions">
          {!hasStarted ? (
            <button onClick={handleStart}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
            >Start <Play size="16px" color="#5ba2fe" /></button>
          ) : (
            <div className="showAfterStart">
              <button onClick={handleStop}
                style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
              >Stop <CircleStop size="16px" color="#5ba2fe" /></button>
              {!isPaused ? (
                <button onClick={handlePause}
                  style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
                >Pause <Pause size="16px" color="#5ba2fe" /></button>
              ) : (
                <button onClick={handleResume}
                  style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
                >Resume <Play size="16px" color="#5ba2fe" /></button>
              )}
            </div>
          )}
        </div>
        <div className="timerCount">
          <span style={{}}>{String(Math.floor(timer / 60)).padStart(2, "0")} m</span>
          <span>{String(timer % 60).padStart(2, "0")} s</span>
        </div>
      </div>

      {/* Workout Container */}
      <div className="workoutContainer">

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
                      <button onClick={() => handleAddSet(workout.id)} style={{border:'0',background:'#5ba2fe20',borderRadius:'50px',display:'flex',alignItems:'center',padding:'0 12px'}}
                      
                      ><CirclePlus size='16px' color="#5ba2fe"/></button>
                      

                    </div>
                  </div>
                  <div className="reps">
                    <input
                      type="text"
                      className="rep"
                      placeholder="Reps"
                      value={workout.currentReps}
                      onChange={(e) => handleInputChange(workout.id, 'currentReps', e.target.value)}

                    />
                  </div>
                  <div className="weights">
                    <input
                      type="text"
                      className="weight"
                      placeholder="Weight"
                      value={workout.currentWeight}
                      onChange={(e) => handleInputChange(workout.id, 'currentWeight', e.target.value)}
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
      {/* <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Current Workouts Data:</h3>
        <pre>{JSON.stringify(currentWorkouts, null, 2)}</pre>
        <h3>Completed Workouts:</h3>
        <pre>{JSON.stringify(workouts, null, 2)}</pre>
      </div> */}
      {showSuccessPopup && (
        <div className="popUpMessage">
          Data Saved
        </div>
      )}
    </div>
  );
};

export default LiveWorkout;