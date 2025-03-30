const express = require("express");
const router = express.Router();
const { saveWorkout,getWorkoutHistory } = require("../controllers/workoutController");


router.post("/save-workout", saveWorkout);
router.get("/workout-history", getWorkoutHistory);


module.exports = router;
