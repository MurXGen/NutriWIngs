const mongoose = require("mongoose");

const DietSchema = new mongoose.Schema({
  DietID: { type: String, required: true },
  FoodName: { type: String},
  Date: { type: String, required: true },
  Time: { type: String, required: true },
  DietStatus: { type: String, enum: ["Draft", "Saved", "Quick"], required: true },
  PortionSize: Number,
  TotalCalories: Number,
  Carbs: Number,
  Protein: Number,
  Fats: Number,
  ImageUrl: { type: String },
  DietTaken: {
    CaloriesTaken: Number,
    PortionSizeTaken: Number,
    Carbs: Number,
    Protein: Number,
    Fats: Number
  }
});


const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  authentication: {
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  healthDetails: {
    weight: { type: Number, required: true },
    height: { type: String, required: true },
    lifestyle: { type: String, required: true },
    RecomCal: { type: Number, required: true }
  },
  healthDiets: [DietSchema],
 
});

module.exports = mongoose.model("User", UserSchema);
