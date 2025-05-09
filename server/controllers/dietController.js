const User = require("../models/User");

const cloudinary = require("../config/cloudinaryConfig");

const logDiet = async (req, res) => {
  try {
    const { 
      userId, foodName, date, time, dietStatus, portionSize, totalCalories, carbs, protein, fats, portionSizeTaken, imageUrl 
    } = req.body;

   
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalImageUrl = imageUrl || "";

   
    if (!imageUrl && req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    }

   
    const roundToOneDecimal = (num) => isNaN(num) ? 0 : parseFloat(num.toFixed(1));

   
    const portionSizeNum = roundToOneDecimal(parseFloat(portionSize) || 0);
    const portionSizeTakenNum = roundToOneDecimal(parseFloat(portionSizeTaken) || 0);
    const totalCaloriesNum = roundToOneDecimal(parseFloat(totalCalories) || 0);
    const carbsNum = roundToOneDecimal(parseFloat(carbs) || 0);
    const proteinNum = roundToOneDecimal(parseFloat(protein) || 0);
    const fatsNum = roundToOneDecimal(parseFloat(fats) || 0);

   
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

   
    const newDiet = {
      DietID: Date.now().toString(),
      FoodName: foodName,
      Date: date,
      Time: time,
      DietStatus: dietStatus,
      PortionSize: portionSizeNum,
      TotalCalories: totalCaloriesNum,
      Carbs: carbsNum,
      Protein: proteinNum,
      Fats: fatsNum,
      ImageUrl: finalImageUrl, 
      DietTaken: dietTaken
    };

   
    user.healthDiets.push(newDiet);
    await user.save();

    res.status(201).json({ message: "Diet logged successfully", diet: newDiet });
  } catch (error) {
    console.error("Diet Logging Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteDietEntry = async (req, res) => {
  const { userId, dietId } = req.params;

  try {
    console.log(`Attempting to delete diet entry for userId: ${userId}, dietId: ${dietId}`);

   
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found. Diet entries before deletion:", user.healthDiets.length);

   
    const initialLength = user.healthDiets.length;
    user.healthDiets = user.healthDiets.filter(diet => diet.DietID !== dietId);

   
    if (user.healthDiets.length === initialLength) {
      console.log("DietID not found in user's healthDiets");
      return res.status(404).json({ message: "Diet entry not found" });
    }

    console.log("Diet entry deleted. Saving user document...");
    await user.save();

    console.log("User saved successfully. Returning success response.");
    res.status(200).json({ message: "Diet entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting diet entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getDietById = async (req, res) => {
  const { dietId } = req.params;
  try {
    const user = await User.findOne(
      { "healthDiets.DietID": dietId.toString() },
      { "healthDiets.$": 1 }
    );

    if (!user || !user.healthDiets.length) {
      return res.status(404).json({ message: "Diet entry not found" });
    }
    res.json(user.healthDiets[0]);
  } catch (error) {
    console.error("Error fetching diet:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateDiet = async (req, res) => {
  try {
    const { 
      userId, foodName, date, time, dietStatus, portionSize, totalCalories, carbs, protein, fats, portionSizeTaken, imageUrl 
    } = req.body;
    const { dietId } = req.params;

    console.log("Received update request:", req.body);

   
    const user = await User.findOne({ "healthDiets.DietID": dietId });
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalImageUrl = imageUrl || "";

   
    if (!imageUrl && req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    }

   
    const dietStatusMap = {
      saved: "Saved",
      draft: "Draft"
    };
    const validatedDietStatus = dietStatusMap[dietStatus] || "Saved";

   
    const roundToOneDecimal = (num) => isNaN(num) ? 0 : parseFloat(num.toFixed(1));

   
    const portionSizeNum = roundToOneDecimal(parseFloat(portionSize) || 0);
    const portionSizeTakenNum = roundToOneDecimal(parseFloat(portionSizeTaken) || 0);
    const totalCaloriesNum = roundToOneDecimal(parseFloat(totalCalories) || 0);
    const carbsNum = roundToOneDecimal(parseFloat(carbs) || 0);
    const proteinNum = roundToOneDecimal(parseFloat(protein) || 0);
    const fatsNum = roundToOneDecimal(parseFloat(fats) || 0);

   
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

   
    const updatedDiet = await User.findOneAndUpdate(
      { "healthDiets.DietID": dietId },
      {
        $set: {
          "healthDiets.$.FoodName": foodName,
          "healthDiets.$.Date": date,
          "healthDiets.$.Time": time,
          "healthDiets.$.DietStatus": validatedDietStatus,
          "healthDiets.$.PortionSize": portionSizeNum,
          "healthDiets.$.TotalCalories": totalCaloriesNum,
          "healthDiets.$.Carbs": carbsNum,
          "healthDiets.$.Protein": proteinNum,
          "healthDiets.$.Fats": fatsNum,
          "healthDiets.$.ImageUrl": finalImageUrl,
          "healthDiets.$.DietTaken": dietTaken
        }
      },
      { new: true }
    );

    if (!updatedDiet) return res.status(404).json({ message: "Diet entry not found" });

    res.status(200).json({ message: "Diet updated successfully", diet: updatedDiet });
  } catch (error) {
    console.error("Diet Update Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



const getDietHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.healthDiets || []);
  } catch (error) {
    console.error("Error fetching diet history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
  

module.exports = {getDietById, logDiet ,getDietHistory,updateDiet,deleteDietEntry};