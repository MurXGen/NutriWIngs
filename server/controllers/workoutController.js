const Workout = require("../models/Workout");

exports.saveWorkout = async (req, res) => {
  try {
    const { userId } = req.cookies; // Extract userId from cookies
    const { workouts } = req.body; // Extract workouts from request body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    if (!workouts || workouts.length === 0) {
      return res.status(400).json({ message: "No workouts provided" });
    }

    const newWorkout = new Workout({
      userId,
      workouts,
    });

    await newWorkout.save();

    res.status(201).json({ message: "Workout data saved successfully", data: newWorkout });
  } catch (error) {
    console.error("Error saving workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

