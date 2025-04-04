const User = require("../models/User");
const Workout = require("../models/Workout");
const mongoose = require("mongoose");

exports.getDailyMetrics = async (req, res) => {
  try {
    const userId = req.cookies.userId; // Extract user ID from cookies
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Get current date (YYYY-MM-DD format)
    const today = new Date().toISOString().split("T")[0];

    // Fetch user's total calories intake for today
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const todayCalories = user.healthDiets
      .filter((diet) => diet.Date === today && diet.DietTaken)
      .reduce((total, diet) => total + (diet.DietTaken.CaloriesTaken || 0), 0);

    // Fetch user's total workout duration for today
    const workoutData = await Workout.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
      },
    });

    const todayWorkoutDurationSeconds = workoutData
      ? workoutData.workouts.reduce(
          (total, workout) => total + (workout.duration || 0),
          0
        )
      : 0;

    const todayWorkoutDurationMinutes = (
      todayWorkoutDurationSeconds / 60
    );

    res.json({
      totalCalories: todayCalories,
      totalDuration: todayWorkoutDurationMinutes,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Start sleep
exports.startSleep = async (req, res) => {
    const { userId } = req.body;
    const startDateTime = new Date();
  
    console.log("🔁 Start Sleep Triggered");
    console.log("📦 Request Body:", req.body);
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("✅ User found:", user._id);
  
      // Ensure recoveryFactors and sleepTrack are initialized
      if (!user.recoveryFactors) {
        console.log("⚠️ recoveryFactors missing. Initializing...");
        user.recoveryFactors = { sleepTrack: [] };
      } else if (!user.recoveryFactors.sleepTrack) {
        console.log("⚠️ sleepTrack missing. Initializing...");
        user.recoveryFactors.sleepTrack = [];
      }
  
      user.recoveryFactors.sleepTrack.push({
        startDateTime,
        endDateTime: null,
        totalDuration: 0
      });
  
      await user.save();
      console.log("💾 Sleep entry added for user:", user._id);
      res.status(200).json({ message: "Sleep tracking started", startDateTime });
  
    } catch (err) {
      console.error("🚨 Error in startSleep:", err.message);
      res.status(500).json({ message: "Failed to start sleep", error: err.message });
    }
  };
  
  

// Stop sleep
exports.stopSleep = async (req, res) => {
    const { userId } = req.body;
    const endDateTime = new Date();
  
    console.log("⏹️ Stop Sleep Triggered");
    console.log("📦 Request Body:", req.body);
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      const latestSleep = user.recoveryFactors.sleepTrack.slice(-1)[0];
      if (!latestSleep || latestSleep.endDateTime) {
        console.log("⚠️ No active sleep session to stop");
        return res.status(400).json({ message: "No active sleep tracking session" });
      }
  
      latestSleep.endDateTime = endDateTime;
      latestSleep.totalDuration = Math.floor((endDateTime - new Date(latestSleep.startDateTime)) / 1000);
  
      await user.save();
      console.log("✅ Sleep tracking stopped at:", endDateTime);
      res.status(200).json({ message: "Sleep tracking stopped", endDateTime, totalDuration: latestSleep.totalDuration });
  
    } catch (err) {
      console.error("🚨 Error in stopSleep:", err.message);
      res.status(500).json({ message: "Failed to stop sleep", error: err.message });
    }
  };
  

// Manual entry
exports.manualSleepEntry = async (req, res) => {
    const { userId, duration } = req.body;
  
    console.log("✍️ Manual Sleep Entry Triggered");
    console.log("📦 Request Body:", req.body);
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      user.recoveryFactors.sleepTrack.push({
        startDateTime: null,
        endDateTime: null,  
        totalDuration: duration
      });
  
      await user.save();
      console.log("✅ Manual sleep entry added for:", user._id);
      res.status(200).json({ message: "Manual sleep entry added", duration });
  
    } catch (err) {
      console.error("🚨 Error in manualSleepEntry:", err.message);
      res.status(500).json({ message: "Failed to add manual sleep entry", error: err.message });
    }
  };
  

  exports.getLatestSleep = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const sleepEntries = user.recoveryFactors?.sleepTrack || [];
      if (sleepEntries.length === 0) {
        return res.status(200).json({ message: "No sleep data found", latestSleep: null });
      }
  
      let latestSleep = sleepEntries[sleepEntries.length - 1];
  
      // Check if the sleep entry is still running (i.e., endDateTime is null)
      if (latestSleep.startDateTime && !latestSleep.endDateTime) {
        const startTime = new Date(latestSleep.startDateTime);
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000); // Convert ms to sec
  
        if (elapsedSeconds >= 12 * 60 * 60) { // 12 hours in seconds
          // Stop the sleep at 10 hours
          latestSleep.endDateTime = new Date();
          latestSleep.totalDuration = 10 * 60 * 60; // 10 hours in seconds
  
          // Save the updated user data
          await user.save();
          console.log(`⏰ Auto-stopped sleep at 10 hours for user: ${userId}`);
        }
      }
  
      res.status(200).json({ latestSleep });
    } catch (error) {
      console.error("Error fetching latest sleep:", error);
      res.status(500).json({ message: "Failed to fetch latest sleep data", error: error.message });
    }
  };
