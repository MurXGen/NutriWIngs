const express = require('express');
const multer = require('multer');
const {
  getWorkouts, createWorkout, updateWorkout, deleteWorkout
} = require('../controllers/workoutController');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', cloudinary.config());

const storage = new CloudinaryStorage({
  cloudinary,
 params: {
  folder: 'nutriwings-workouts',
  allowed_formats: ['jpg', 'jpeg', 'png'], // current
}

});


const upload = multer({ storage });


const router = express.Router();

router.get('/', getWorkouts);
router.post('/', upload.single('image'), createWorkout);
router.put('/:id', upload.single('image'), updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
