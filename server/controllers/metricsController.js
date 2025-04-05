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
      totalDuration: duration,
      createdAt: new Date(),
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

    // Sort all entries by createdAt (or fallback to startDateTime/endDateTime)
    const sortedEntries = sleepEntries
      .filter(entry => entry.totalDuration != null) // includes both manual and timer entries
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.endDateTime || a.startDateTime || 0);
        const dateB = new Date(b.createdAt || b.endDateTime || b.startDateTime || 0);
        return dateB - dateA;
      });

    let latestSleep = sortedEntries[0];

    // Handle ongoing timer logic only if applicable
    if (latestSleep?.startDateTime && !latestSleep.endDateTime) {
      const startTime = new Date(latestSleep.startDateTime);
      const currentTime = new Date();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

      if (elapsedSeconds >= 12 * 60 * 60) {
        // Auto-stop after 12 hours, capped at 10 hours
        latestSleep.endDateTime = currentTime;
        latestSleep.totalDuration = 10 * 60 * 60;

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


exports.getTotalSleepDuration = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || !user.recoveryFactors || !user.recoveryFactors.sleepTrack) {
      return res.status(404).json({ message: "Sleep data not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDuration = user.recoveryFactors.sleepTrack.reduce((total, entry, index) => {
      const fallbackDate = entry._id.getTimestamp(); // from MongoDB ObjectId
      const entryDate = new Date(entry.createdAt || entry.startDateTime || fallbackDate);

      const isToday = entryDate >= today;
      const validDuration = !isNaN(entry.totalDuration);

      return isToday && validDuration ? total + entry.totalDuration : total;
    }, 0);

    console.log("🧮 Total Duration (seconds):", totalDuration);

    res.status(200).json({ totalDuration });
  } catch (error) {
    console.error("❌ Error fetching total sleep duration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.deleteSleepEntry = async (req, res) => {
  const { userId, entryId } = req.params;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { "recoveryFactors.sleepTrack": { _id: entryId } },
    });

    res.status(200).json({ message: "Sleep entry deleted." });
  } catch (err) {
    console.error("Failed to delete sleep entry:", err);
    res.status(500).json({ error: "Failed to delete entry." });
  }
};

exports.getTodaysSleepEntries = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const entries = user.recoveryFactors.sleepTrack.filter((entry, i) => {
      const fallbackDate = entry._id.getTimestamp(); // fallback from ObjectId
      const entryDate = new Date(entry.createdAt || entry.startDateTime || fallbackDate);
      const hasValidDuration = !isNaN(entry.totalDuration) && entry.totalDuration > 0;
      const isToday = entryDate >= todayStart && entryDate <= todayEnd;



      return hasValidDuration && isToday;
    });

    entries.forEach((entry, i) => {
      const displayDate = new Date(entry.createdAt || entry.startDateTime || entry._id.getTimestamp());
    });

    res.status(200).json({ entries });
  } catch (err) {
    console.error("❌ Error fetching today's sleep entries:", err);
    res.status(500).json({ error: "Failed to fetch sleep entries." });
  }
};



exports.addWaterEntry = async (req, res) => {
  const { userId } = req.params;
  const { waterContent } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newEntry = {
      waterContent,
      recordDateTime: new Date(),
    };

    user.recoveryFactors.waterIntake.push(newEntry);
    await user.save();

    res.status(201).json({ message: 'Water entry added' });
  } catch (err) {
    console.error('Error adding water entry:', err);
    res.status(500).json({ error: 'Failed to add entry' });
  }
};

exports.getTodaysWaterEntries = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const entries = user.recoveryFactors.waterIntake.filter((entry) => {
      const date = new Date(entry.recordDateTime);
      return date >= startOfDay && date <= endOfDay;
    });

    res.status(200).json({ entries });
  } catch (err) {
    console.error('Error fetching today\'s water entries:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

exports.deleteWaterEntry = async (req, res) => {
  const { userId, entryId } = req.params;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { "recoveryFactors.waterIntake": { _id: entryId } },
    });

    res.status(200).json({ message: 'Entry deleted' });
  } catch (err) {

    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

