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

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const workoutRecords = await Workout.find({ userId }).sort({ startTime: -1 });

    const groupedByDate = {};

    workoutRecords.forEach((record) => {
      const dateKey = new Date(record.startTime).toDateString();

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: record.startTime,
          duration: 0,
          workouts: [],
        };
      }

      groupedByDate[dateKey].duration += record.duration;
      groupedByDate[dateKey].workouts.push(
        ...record.workouts.map((w) => ({
          imageUrl: w.imageUrl,
          workoutName: w.workoutName,
          category: w.category,
          actions: w.actions,
        }))
      );
    });

    const formattedWorkouts = Object.values(groupedByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

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

    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    const workoutDoc = await Workout.findOne({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
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

    const inputDate = new Date(workout.date);
    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    const workoutDoc = await Workout.findOne({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      "workouts.workoutName": workout.workoutName,
    });

    if (!workoutDoc) return res.status(404).json({ message: "Workout not found" });

    const workoutToEdit = workoutDoc.workouts.find(w => w.workoutName === workout.workoutName);

    if (workoutToEdit && workoutToEdit.actions.has(setKey)) {
      workoutToEdit.actions.delete(setKey);
      workoutDoc.markModified("workouts");
      await workoutDoc.save();
      return res.status(200).json({ message: "Workout set deleted successfully" });
    }

    res.status(404).json({ message: "Set not found" });
  } catch (error) {
    console.error("Delete workout action error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.deleteWorkoutSession = async (req, res) => {
  try {
    const { userId } = req.cookies;
    const { date } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    const deleted = await Workout.deleteMany({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Workout session not found" });
    }

    res.status(200).json({ message: "Workout session(s) deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





