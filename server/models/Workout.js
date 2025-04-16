const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
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
      }
    }
  ],
});

module.exports = mongoose.model("Workout", WorkoutSchema);
