const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const { deleteWorkoutSession, deleteSingleWorkoutAction, updateWorkoutAction, saveWorkout, getWorkoutHistory } = require("../controllers/workoutController");



const workoutTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
}, { collection: 'workouttemplates' });
// const tempConnection = mongoose.createConnection('mongodb://localhost:27017/Nutriwings_Admin');
const WorkoutTemplate = tempConnection.model('WorkoutTemplate', workoutTemplateSchema);


router.post("/save-workout", saveWorkout);


router.get("/workout-history", getWorkoutHistory);

router.put("/update", updateWorkoutAction);
router.put("/delete-single", deleteSingleWorkoutAction);

router.delete("/delete-session", deleteWorkoutSession);

router.get('/templates', async (req, res, next) => {
    try {
        console.log('Fetching workout templates...'); // Debug log
        const templates = await WorkoutTemplate.find({});
        console.log('Found templates:', templates); // Debug log
        res.json(templates);
    } catch (error) {
        console.error('Error in /templates route:', error);
        next(error); // Pass to error handler
    }
});

module.exports = router;
