const express = require("express");
const { logDiet, getDietHistory } = require("../controllers/dietController");
const router = express.Router();
const upload = require("../middlewares/multer");
const User = require("../models/User");
console.log('getDietHistory:', getDietHistory);

router.post("/log", upload.single("foodImage"), logDiet);

router.get("/get", async (req, res) => {
  try {
    const { userId, dietId } = req.query;
    if (!userId || !dietId) {
      return res.status(400).json({ error: "Missing userId or dietId" });
    }

    const user = await User.findOne({ _id: userId, "healthDiets.DietID": dietId }, { "healthDiets.$": 1 });

    if (!user || !user.healthDiets.length) {
      return res.status(404).json({ error: "Diet entry not found" });
    }

    res.json(user.healthDiets[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/history", getDietHistory);

router.get("/diet-stats", async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!date || !userId) {
      return res.status(400).json({ success: false, message: "Date and User ID are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFats = 0;

    user.healthDiets.forEach((diet) => {
      if (diet.Date === date) {
        totalCalories += diet.DietTaken?.CaloriesTaken || 0;
        totalCarbs += diet.DietTaken?.Carbs || 0;
        totalProtein += diet.DietTaken?.Protein || 0;
        totalFats += diet.DietTaken?.Fats || 0;
      }
    });

    res.json({
      success: true,
      stats: { totalCalories, totalCarbs, totalProtein, totalFats },
    });
  } catch (error) {
    console.error("Error fetching diet stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/recomcal", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch recommended calorie intake from the healthDetails object
    const recomCal = user.healthDetails?.RecomCal; // Default to 2000 if not set

    res.json({ success: true, recomCal });
  } catch (error) {
    console.error("Error fetching recommended calories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, age, gender, healthDetails } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user details
    user.name = name || user.name;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.healthDetails = {
      weight: healthDetails.weight || user.healthDetails.weight,
      height: healthDetails.height || user.healthDetails.height,
      lifestyle: healthDetails.lifestyle || user.healthDetails.lifestyle,
      RecomCal: healthDetails.RecomCal || user.healthDetails.RecomCal, // Ensure RecomCal is updated
    };

    // Save the updated user
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/calorie-data", async (req, res) => {
  try {
    const { year, month, userId } = req.query;

    if (!year || !month || !userId) {
      return res.status(400).json({ success: false, message: "Year, month, and user ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const calorieData = {};
    user.healthDiets.forEach((diet) => {
      const dietDate = new Date(diet.Date);
      if (dietDate.getFullYear() == year && dietDate.getMonth() + 1 == month) {
        const dateKey = dietDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        calorieData[dateKey] = (calorieData[dateKey] || 0) + (diet.DietTaken?.CaloriesTaken || 0);
      }
    });

    res.json({ success: true, calorieData });
  } catch (error) {
    console.error("Error fetching calorie data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;