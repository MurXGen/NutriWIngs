const User = require("../models/User");

const cloudinary = require("../config/cloudinaryConfig");

const logDiet = async (req, res) => {
  try {
    const { 
      userId, foodName, date, time, dietStatus, portionSize, totalCalories, carbs, protein, fats, portionSizeTaken, imageUrl 
    } = req.body;

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalImageUrl = imageUrl || ""; // Use imageUrl from frontend if available

    // Upload image to Cloudinary only if no imageUrl is provided from frontend
    if (!imageUrl && req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    }

    // Mapping frontend values to valid schema values
    const dietStatusMap = {
      saved: "Saved",
      draft: "Draft"
    };
    
    // Validate dietStatus
    const validatedDietStatus = dietStatusMap[dietStatus] || "Saved"; // Default to "Planned"

    // Function to round values to 1 decimal place
    const roundToOneDecimal = (num) => isNaN(num) ? 0 : parseFloat(num.toFixed(1));

    // Convert and round values
    const portionSizeNum = roundToOneDecimal(parseFloat(portionSize) || 0);
    const portionSizeTakenNum = roundToOneDecimal(parseFloat(portionSizeTaken) || 0);
    const totalCaloriesNum = roundToOneDecimal(parseFloat(totalCalories) || 0);
    const carbsNum = roundToOneDecimal(parseFloat(carbs) || 0);
    const proteinNum = roundToOneDecimal(parseFloat(protein) || 0);
    const fatsNum = roundToOneDecimal(parseFloat(fats) || 0);

    // Calculate DietTaken values
    let dietTaken = {
      CaloriesTaken: 0,
      PortionSizeTaken: portionSizeTakenNum,
      Carbs: 0,
      Protein: 0,
      Fats: 0
    };

    if (portionSizeTakenNum > 0 && portionSizeNum > 0) {
      const ratio = portionSizeTakenNum / portionSizeNum;
      dietTaken.CaloriesTaken = roundToOneDecimal(ratio * totalCaloriesNum);
      dietTaken.Carbs = roundToOneDecimal(ratio * carbsNum);
      dietTaken.Protein = roundToOneDecimal(ratio * proteinNum);
      dietTaken.Fats = roundToOneDecimal(ratio * fatsNum);
    }

    // Create new diet entry
    const newDiet = {
      DietID: Date.now().toString(),
      FoodName: foodName,
      Date: date,
      Time: time,
      DietStatus: validatedDietStatus, // Mapped dietStatus
      PortionSize: portionSizeNum,
      TotalCalories: totalCaloriesNum,
      Carbs: carbsNum,
      Protein: proteinNum,
      Fats: fatsNum,
      ImageUrl: finalImageUrl,  // Save the correct image URL
      DietTaken: dietTaken
    };

    // Add diet entry to user's healthDiets array
    user.healthDiets.push(newDiet);
    await user.save();

    res.status(201).json({ message: "Diet logged successfully", diet: newDiet });
  } catch (error) {
    console.error("Diet Logging Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};










const getDietHistory = async (req, res) => {
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
  

module.exports = { logDiet ,getDietHistory};