const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/profile", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-authentication.password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ✅ User Session (used in Profile Page)
router.get("/session", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-authentication.password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/logout",(req, res) => {
  res.clearCookie("userId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
});

router.put("/:id", async (req, res) => {
  try {
    const { name, age, gender, weight, height, lifestyle } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        age,
        gender,
        "healthDetails.weight": weight,
        "healthDetails.height": height,
        "healthDetails.lifestyle": lifestyle,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  const { age, gender, mobile, password, healthDetails } = req.body;

  if (!age || !gender || !mobile || !password || !healthDetails?.weight || !healthDetails?.height || !healthDetails?.lifestyle) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const existingUser = await User.findOne({ "authentication.mobile": mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    const heightInCm = parseInt(healthDetails.height);
    if (isNaN(heightInCm) || isNaN(healthDetails.weight) || isNaN(age)) {
      return res.status(400).json({ message: "Invalid numeric values" });
    }

    let BMR = gender === "Male"
      ? 10 * healthDetails.weight + 6.25 * heightInCm - 5 * age + 5
      : 10 * healthDetails.weight + 6.25 * heightInCm - 5 * age - 161;

    const activityFactors = {
      "Sedentary": 1.2,
      "Moderately Active": 1.55,
      "Active": 1.9
    };

    let activityFactor = activityFactors[healthDetails.lifestyle] || 1.2;
    const RecomCal = Math.round(BMR * activityFactor);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      age,
      gender,
      authentication: { mobile, password: hashedPassword },
      healthDetails: {
        weight: healthDetails.weight,
        height: heightInCm,
        lifestyle: healthDetails.lifestyle,
        RecomCal,
      },
    });

    await newUser.save();

    // ✅ Set Cookie to Keep User Logged In
    res.cookie("userId", newUser._id.toString(), {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ message: "Registration successful", userId: newUser._id });
  } catch (error) {
    console.error("Error saving user:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});





// ✅ Login User
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ "authentication.mobile": mobile });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.authentication.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: false, // Change to `true` in production with HTTPS
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
