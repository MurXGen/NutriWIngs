const Workout = require('../models/WorkoutTemplate');

exports.getWorkouts = async (req, res) => {
  const workouts = await Workout.find();
  res.json(workouts);
};

exports.createWorkout = async (req, res) => {
  const { name, category } = req.body;
  const imageUrl = req.file?.path || ''; // Cloudinary returns .path as the URL
  const newWorkout = new Workout({ name, category, imageUrl });
  await newWorkout.save();
  res.json(newWorkout);
};

exports.updateWorkout = async (req, res) => {
  const { name, category } = req.body;
  const update = { name, category };
  if (req.file) {
    update.imageUrl = req.file.path; // Updated Cloudinary image URL
  }
  const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(updatedWorkout);
};

exports.deleteWorkout = async (req, res) => {
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
};
