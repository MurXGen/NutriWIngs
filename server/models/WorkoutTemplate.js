const mongoose = require('mongoose');

const workoutTemplateSchema = new mongoose.Schema({
  name: String,
  category: String,
  imageUrl: String,
},{ collection: 'workouttemplates' });

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
