const express = require("express");
const router = express.Router();
const { deleteWorkoutSession,deleteSingleWorkoutAction,updateWorkoutAction,saveWorkout,getWorkoutHistory } = require("../controllers/workoutController");


router.post("/save-workout", saveWorkout);
router.get("/workout-history", getWorkoutHistory);

router.put("/update", updateWorkoutAction);
router.put("/delete-single", deleteSingleWorkoutAction);

router.delete("/delete-session", deleteWorkoutSession);

module.exports = router;
