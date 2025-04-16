
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const dietRoutes = require("./routes/dietRoutes");
const dotenv = require('dotenv');
const cloudinary = require("./config/cloudinaryConfig"); 
const metricsRoutes = require("./routes/metricsRoutes");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://nutriwings.vercel.app",
    credentials: true,
  })
);
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get('/', (req, res) => {
  res.send('Welcome to NutriWings API');
});

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/workouts", require("./routes/workoutRoutes"));
app.use("/api", metricsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
