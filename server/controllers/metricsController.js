const User = require("../models/User");
const Workout = require("../models/Workout");
const mongoose = require("mongoose");

exports.getDailyMetrics = async (req, res) => {
  try {
    const userId = req.cookies.userId;
    console.log("User ID from cookie:", userId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ No user found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

   
    const todayDiets = user.healthDiets.filter(diet => {
      const dietDate = new Date(diet.Date);
      return dietDate >= startOfDay && dietDate <= endOfDay && diet.DietTaken;
    });

    const todayCalories = todayDiets.reduce((total, diet) => {
      return total + (diet.DietTaken.CaloriesTaken || 0);
    }, 0);

   
    const workouts = await Workout.find({
      userId: new mongoose.Types.ObjectId(userId),
      startTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    console.log("🏋️ All Workouts Today:", workouts);

   
    const totalWorkoutDurationSeconds = workouts.reduce((sum, doc) => {
      return sum + (doc.duration || 0);
    }, 0);

    const totalWorkoutDurationMinutes = totalWorkoutDurationSeconds / 60;

   
    const formattedCalories = Number(todayCalories.toFixed(1));
    const formattedDuration = Number(totalWorkoutDurationMinutes.toFixed(2));

    console.log("🔥 Calories Taken Today:", formattedCalories);
    console.log("🏋️ Total Workout Duration (min):", formattedDuration);

    res.json({
      totalCalories: formattedCalories,
      totalDuration: formattedDuration,
    });
  } catch (error) {
    console.error("❌ Error fetching metrics:", error);
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
  const { userId, duration, endDateTime } = req.body;

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
      endDateTime: endDateTime,
      totalDuration: duration,
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

   
    const sortedEntries = sleepEntries
      .filter(entry => entry.totalDuration != null)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.endDateTime || a.startDateTime || 0);
        const dateB = new Date(b.createdAt || b.endDateTime || b.startDateTime || 0);
        return dateB - dateA;
      });

    let latestSleep = sortedEntries[0];

   
    if (latestSleep?.startDateTime && !latestSleep.endDateTime) {
      const startTime = new Date(latestSleep.startDateTime);
      const currentTime = new Date();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

      if (elapsedSeconds >= 12 * 60 * 60) {
       
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
      const fallbackDate = entry._id.getTimestamp();
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
      const fallbackDate = entry._id.getTimestamp();
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

exports.calculateStrengthScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { healthDetails, healthDiets, recoveryFactors } = user;
    const { weight, RecomCal } = healthDetails;

   
    const todayDiets = healthDiets.filter(d => {
      const dietDate = new Date(d.Date);
      return dietDate >= startOfDay && dietDate <= endOfDay;
    });

    let totalProtein = 0, totalCarbs = 0, totalFats = 0;
    todayDiets.forEach(d => {
      if (d.DietTaken) {
        totalProtein += d.DietTaken.Protein || 0;
        totalCarbs += d.DietTaken.Carbs || 0;
        totalFats += d.DietTaken.Fats || 0;
      }
    });

    const totalCals = (totalProtein * 4) + (totalCarbs * 4) + (totalFats * 9);
    const proteinTarget = weight;

   
    const waterIntakeToday = recoveryFactors?.waterIntake?.filter(w =>
      new Date(w.recordDateTime) >= startOfDay && new Date(w.recordDateTime) <= endOfDay
    ).reduce((sum, w) => sum + w.waterContent, 0) || 0;

   
    const sleepToday = recoveryFactors?.sleepTrack?.filter(s => {
      const hasDuration = s.totalDuration && s.totalDuration > 0;

      const endDate = s.endDateTime ? new Date(s.endDateTime) : null;
      const startDate = s.startDateTime ? new Date(s.startDateTime) : null;

      const isEndToday = endDate && endDate >= startOfDay && endDate <= endOfDay;
      const isStartToday = startDate && startDate >= startOfDay && startDate <= endOfDay;

      return hasDuration && (isEndToday || isStartToday);
    });

    const totalSleepSecs = sleepToday.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const sleepHours = totalSleepSecs / 3600;


   
    const todayWorkout = await Workout.find({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay }
    });

    const weeklyWorkouts = await Workout.find({
      userId,
      startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

   
    const totalTodayDurationSecs = todayWorkout.reduce((sum, w) => sum + (w.duration || 0), 0);
    const workoutDurationMins = totalTodayDurationSecs / 60;
    const durationPoints = Math.min((workoutDurationMins / 60) * 20, 20);

    const totalWeeklyDurationSecs = weeklyWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const weeklyTotalDurationMins = totalWeeklyDurationSecs / 60;
    const consistencyPoints = weeklyTotalDurationMins >= 210 ? 5 : 0;

   
    const intensitySleep = Math.min(sleepHours, 8);
    const intensityPoints = (intensitySleep / 8) * 7.5;

    let totalFailures = 0;

    todayWorkout.forEach(w => {
      w.workouts?.forEach(wo => {
        const actions = wo.actions ? [...wo.actions.values()] : [];
        actions.forEach(a => {
          if (a.failure === "yes") totalFailures++;
        });
      });
    });

    const cappedFailures = Math.min(totalFailures, 4);
    const failurePoints = (cappedFailures / 4) * 7.5;

   
    let todaysReps = 0, todaysWeight = 0, avgTodayWeight = 0;
    let lastWorkoutWeight = 0;
    let mainCategory = "";

   
    todayWorkout.forEach(w => {
      w.workouts.forEach(wo => {
        mainCategory = wo.category;
        [...(wo.actions?.values() || [])].forEach(action => {
          todaysReps += action.reps || 0;
          todaysWeight += action.weight || 0;
        });
      });
    });

    avgTodayWeight = todaysReps > 0 ? todaysWeight / todaysReps : 0;

   
    const lastSimilarWorkout = weeklyWorkouts.reverse().find(w =>
      w.workouts.some(wo => wo.category === mainCategory)
    );

    if (lastSimilarWorkout) {
      const matched = lastSimilarWorkout.workouts.find(wo => wo.category === mainCategory);
      if (matched) {
        const actions = [...(matched.actions?.values() || [])];
        lastWorkoutWeight = actions.length > 0
          ? actions.reduce((sum, a) => sum + (a.weight || 0), 0) / actions.length
          : 0;
      }
    }

    let actionPoints = 0;

    const repsPoints = Math.min((todaysReps / 315) * 7.5, 7.5);
    actionPoints = repsPoints;

    if (avgTodayWeight >= lastWorkoutWeight) {
      actionPoints *= 2;
    }

    actionPoints = Math.min(actionPoints, 15);

   
    const proteinScore = Math.min((totalProtein / proteinTarget) * 20, 20);
    const waterScore = Math.min((waterIntakeToday / 3000) * 10, 10);
    const fatScore = (totalCals && (totalFats * 9 / totalCals <= 0.3)) ? 5 : 0;
    const carbScore = (totalCals && (totalCarbs * 4 / totalCals <= 0.5)) ? 10 : 0;

   
    const totalScore = proteinScore + waterScore + fatScore + carbScore +
      durationPoints + consistencyPoints +
      intensityPoints + failurePoints + actionPoints;

   
    user.StrengthScores = user.StrengthScores.filter(score => {
      const scoreDate = new Date(score.date).toDateString();
      return scoreDate !== new Date().toDateString();
    });

   
    user.StrengthScores.push({
      date: new Date(),
      totalScore: Number(totalScore.toFixed(1)),
      proteinScore: Number(proteinScore.toFixed(1)),
      waterScore: Number(waterScore.toFixed(1)),
      fatScore: Number(fatScore.toFixed(1)),
      carbScore: Number(carbScore.toFixed(1)),
      durationPoints: Number(durationPoints.toFixed(1)),
      consistencyPoints: Number(consistencyPoints.toFixed(1)),
      intensityPoints: Number(intensityPoints.toFixed(1)),
      failurePoints: Number(failurePoints.toFixed(1)),
      actionPoints: Number(actionPoints.toFixed(1))
    });

    await user.save();

    res.status(200).json({
      totalScore: Number(Math.min(totalScore, 100).toFixed(1)),
      details: {
        proteinScore: Number(proteinScore.toFixed(1)),
        waterScore: Number(waterScore.toFixed(1)),
        fatScore: Number(fatScore.toFixed(1)),
        carbScore: Number(carbScore.toFixed(1)),
        durationPoints: Number(durationPoints.toFixed(1)),
        consistencyPoints: Number(consistencyPoints.toFixed(1)),
        intensityPoints: Number(intensityPoints.toFixed(1)),
        failurePoints: Number(failurePoints.toFixed(1)),
        actionPoints: Number(actionPoints.toFixed(1)),
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getStrengthScoreByDate = async (req, res) => {
  const { userId, date } = req.params;

  try {
    console.log('Received userId:', userId);
    console.log('Received date:', date);

    const targetDate = new Date(date);
    console.log('Target date:', targetDate);

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    console.log('Start of day:', startOfDay);
    console.log('End of day:', endOfDay);

   
    const user = await User.findOne({
      _id: userId,
      "StrengthScores.date": { $gte: startOfDay, $lte: endOfDay }
    }).select('StrengthScores');

    if (!user) {
      console.log('No user found for this ID');
      return res.status(404).json({ message: "No user found." });
    }

   
    const scoreRecord = user.StrengthScores.find(score =>
      score.date >= startOfDay && score.date <= endOfDay
    );

    if (!scoreRecord) {
      console.log('No score found for this date');
      return res.status(404).json({ message: "No score found for this date." });
    }

    console.log('Score record found:', scoreRecord);

    const {
      totalScore, proteinScore, waterScore, fatScore, carbScore,
      durationPoints, consistencyPoints, intensityPoints,
      failurePoints, actionPoints
    } = scoreRecord;

    console.log('Scores extracted:', {
      totalScore, proteinScore, waterScore, fatScore, carbScore,
      durationPoints, consistencyPoints, intensityPoints,
      failurePoints, actionPoints
    });

    return res.json({
      totalScore,
      details: {
        proteinScore, waterScore, fatScore, carbScore,
        durationPoints, consistencyPoints, intensityPoints,
        failurePoints, actionPoints
      }
    });

  } catch (err) {
    console.error('Error occurred:', err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStrengthDates = async (req, res) => {
  const { userId } = req.params; 

  try {
   
    const user = await User.findById(userId).select('StrengthScores');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

   
    const datesWithData = user.StrengthScores.map(score => ({
      date: score.date, 
      totalScore: score.totalScore, 
      proteinScore: score.proteinScore,
      waterScore: score.waterScore,
      fatScore: score.fatScore,
      carbScore: score.carbScore,
      durationPoints: score.durationPoints,
      consistencyPoints: score.consistencyPoints,
      intensityPoints: score.intensityPoints,
      failurePoints: score.failurePoints,
      actionPoints: score.actionPoints
    }));

   
    return res.json({ dates: datesWithData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};





