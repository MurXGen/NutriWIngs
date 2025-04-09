const Workout = require("../models/Workout");

exports.saveWorkout = async (req, res) => {
  try {
    const { userId } = req.cookies; // Extract userId from cookies
    const { workouts, duration, startTime } = req.body; // Extract workouts from request body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    if (!workouts || workouts.length === 0) {
      return res.status(400).json({ message: "No workouts provided" });
    }

    const newWorkout = new Workout({
      userId,
      workouts,
      duration,
      startTime
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

    // Convert to Indian Standard Time (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    // Get start and end of the IST day
    const startOfDayIST = new Date(istTime);
    startOfDayIST.setHours(0, 0, 0, 0);

    const endOfDayIST = new Date(istTime);
    endOfDayIST.setHours(23, 59, 59, 999);

    // Convert back to UTC for MongoDB query
    const startUTC = new Date(startOfDayIST.getTime() - istOffset);
    const endUTC = new Date(endOfDayIST.getTime() - istOffset);

    // Fetch only today’s workouts (based on IST)
    const workoutRecords = await Workout.find({
      userId,
      startTime: { $gte: startUTC, $lte: endUTC },
    }).select("workouts startTime duration");

    console.log("Fetched workout records from DB:", workoutRecords);

    const formattedWorkouts = workoutRecords.map((record) => ({
      duration: record.duration,
      date: record.startTime,
      workouts: record.workouts.map((w) => ({
        workoutName: w.workoutName,
        category: w.category,
        actions: w.actions,
      })),
    }));

    console.log("Formatted Workouts to send:", formattedWorkouts);

    res.status(200).json(formattedWorkouts);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    res.status(500).json([]);
  }
};

exports.updateWorkoutAction = async (req, res) => {
  try {
    const { userId } = req.cookies;
    const { date, workoutName, actions } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const workoutDoc = await Workout.findOne({
      userId,
      startTime: new Date(date),
      "workouts.workoutName": workoutName,
    });

    if (!workoutDoc) return res.status(404).json({ message: "Workout not found" });

    const workoutToUpdate = workoutDoc.workouts.find(w => w.workoutName === workoutName);
    if (workoutToUpdate) {
      workoutToUpdate.actions = actions;
    }

    await workoutDoc.save();

    res.status(200).json({ message: "Workout updated successfully" });
  } catch (error) {
    console.error("Update workout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteSingleWorkoutAction = async (req, res) => {
  try {
    const { userId } = req.cookies;
    const { workout, setKey } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const workoutDoc = await Workout.findOne({
      userId,
      startTime: new Date(workout.date),
      "workouts.workoutName": workout.workoutName,
    });

    if (!workoutDoc) return res.status(404).json({ message: "Workout not found" });

    const workoutToEdit = workoutDoc.workouts.find(w => w.workoutName === workout.workoutName);
    
    if (workoutToEdit && workoutToEdit.actions.has(setKey)) {
      workoutToEdit.actions.delete(setKey);
      workoutDoc.markModified("workouts"); // 🔥 this makes sure Mongoose picks up the change
      await workoutDoc.save();
      return res.status(200).json({ message: "Workout set deleted successfully" });
    }

    res.status(404).json({ message: "Set not found" });
  } catch (error) {
    console.error("Delete workout action error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/workoutController.js
exports.deleteWorkoutSession = async (req, res) => {
  try {
    const { userId } = req.cookies;
    const { date } = req.body; // date = startTime of the session

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Workout.findOneAndDelete({
      userId,
      startTime: new Date(date),
    });

    if (!deleted) {
      return res.status(404).json({ message: "Workout session not found" });
    }

    res.status(200).json({ message: "Workout session deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




