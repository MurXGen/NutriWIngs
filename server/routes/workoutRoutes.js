const express = require("express");
const router = express.Router();
const { saveWorkout } = require("../controllers/workoutController");
const { getWorkoutHistory, updateWorkout, deleteWorkout } = require("../controllers/workoutController");


router.post("/save-workout", saveWorkout);

module.exports = router;
