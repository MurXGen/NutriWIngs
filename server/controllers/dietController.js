const User = require("../models/User");

exports.logDiet = async (req, res) => {
  try {
    const {
      userId,
      foodName,
      portionSize,
      portionSizeTaken,
      carbs,
      protein,
      fats,
      date,
      time,
      dietStatus,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!foodName || !portionSize || !portionSizeTaken || !carbs || !protein || !fats || !date || !time || !dietStatus) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (portionSize === 0) {
      return res.status(400).json({ message: "Portion size cannot be zero" });
    }

    const dietID = new Date().toISOString(); // Use ISO timestamp for uniqueness

    const dietTaken = {
      PortionSizeTaken: portionSizeTaken,
      CaloriesTaken: (portionSizeTaken / portionSize) * (carbs * 4 + protein * 4 + fats * 9),
      Carbs: (portionSizeTaken / portionSize) * carbs,
      Protein: (portionSizeTaken / portionSize) * protein,
      Fats: (portionSizeTaken / portionSize) * fats,
    };

    const newDiet = {
      DietID: dietID,
      FoodName: foodName,
      Date: date,
      Time: time,
      DietStatus: dietStatus,
      PortionSize: portionSize,
      TotalCalories: carbs * 4 + protein * 4 + fats * 9,
      Carbs: carbs,
      Protein: protein,
      Fats: fats,
      DietTaken: dietTaken,
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.healthDiets) {
      user.healthDiets = [];
    }

    user.healthDiets.push(newDiet);
    await user.save();

    res.status(201).json({ message: "Diet logged successfully", diet: newDiet });
  } catch (error) {
    console.error("Error logging diet:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDietHistory = async (req, res) => {
  try {
    const { userId } = req.query; // FIXED: Extract userId from query, not params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.healthDiets || []); // Return diet history
  } catch (error) {
    console.error("Error fetching diet history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
  