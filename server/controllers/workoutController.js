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

exports.getWorkoutHistory = async (req, res) => {
  try {
    const { userId } = req.cookies;
    console.log("User ID from cookies:", userId); // Debugging user ID

    if (!userId) {
      console.log("Unauthorized request: No user ID found");
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const workoutRecords = await Workout.find({ userId }).select("workouts date");
    console.log("Fetched workout records from DB:", workoutRecords); // Log raw DB response

    // Flatten the workouts array
    const formattedWorkouts = workoutRecords.flatMap((record) =>
      record.workouts.map((workout) => ({
        workoutName: workout.workoutName,
        category: workout.category,
        duration: workout.duration,
        date: record.date, // Use the parent document's date
        actions: workout.actions,
      }))
    );

    console.log("Formatted Workouts to send:", formattedWorkouts); // Final response before sending

    res.status(200).json(formattedWorkouts);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    res.status(500).json([]);
  }
};


