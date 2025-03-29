
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const dietRoutes = require("./routes/dietRoutes");
const dotenv = require('dotenv');
const cloudinary = require("./config/cloudinaryConfig"); 


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/workouts", require("./routes/workoutRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
