const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  workouts: [
    {
      workoutName: String,
      imageUrl: String,
      category: String,
      actions: {
        type: Map,
        of: {
          set: Number,
          reps: Number,
          weight: Number,
          failure: String,
        },
      },
      startTime: Date,
      duration: Number, // Total duration in seconds
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Workout", WorkoutSchema);
