import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

const API = 'http://localhost:5000/api/workouts';

export default function WorkoutTemplates() {
  const [workouts, setWorkouts] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', image: null });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categoryLocked, setCategoryLocked] = useState(false);


  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const res = await axios.get(API);
    setWorkouts(res.data);
  };

  const getUniqueCategories = () => {
    const categories = workouts.map(w => w.category);
    return [...new Set(categories)];
  };


  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('category', formData.category);
    if (formData.image) form.append('image', formData.image);

    if (editId) {
      await axios.put(`${API}/${editId}`, form);
    } else {
      await axios.post(API, form);
    }

    setFormData({ name: '', category: '', image: null });
    setImagePreview(null);
    setEditId(null);
    fetchWorkouts();
  };

  const handleEdit = (workout) => {
    setEditId(workout._id);
    setFormData({ name: workout.name, category: workout.category, image: null });
    setImagePreview(workout.imageUrl);
    setCategoryLocked(false);
  };


  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchWorkouts();
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', image: null });
    setImagePreview(null);
    setEditId(null);
    setCategoryLocked(false);
  };


  return (
    <div className="workout-app">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="app-title"
      >
        Workout Template Manager
      </motion.h1>

      <motion.div
        className="form-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="workout-form">
          <div className="form-group">
            <input
              name="name"
              placeholder="Workout Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-input"
              disabled={categoryLocked}
            />
            <div className="category-suggestions">
              {getUniqueCategories().map((cat) => (
                <motion.button
                  key={cat}
                  type="button"
                  className="category-tag"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: cat }));
                    setCategoryLocked(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>

          </div>

          <div className="form-group">
            <label className="file-upload">
              <span>{formData.image ? 'Change Image' : 'Upload Image'}</span>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*,.gif"
                className="file-input"
              />

            </label>
          </div>

          {imagePreview && (
            <motion.div
              className="image-preview-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={imagePreview} alt="Preview" className="image-preview" />

            </motion.div>
          )}

          <div className="form-actions">
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {editId ? 'Update Workout' : 'Add Workout'}
            </motion.button>

            {editId && (
              <motion.button
                type="button"
                onClick={resetForm}
                className="cancel-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      <motion.div className="workouts-container">
        <AnimatePresence>
          {workouts.map((w) => (
            <motion.div
              key={w._id}
              className="workout-card"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="workout-image-container">
                <img src={w.imageUrl} alt={w.name} className="workout-image" />
              </div>

              <div className="workout-info">
                <h3 className="workout-name">{w.name}</h3>
                <p className="workout-category">{w.category}</p>
              </div>

              <div className="workout-actions">
                <motion.button
                  onClick={() => handleEdit(w)}
                  className="edit-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Edit
                </motion.button>

                <motion.button
                  onClick={() => handleDelete(w._id)}
                  className="delete-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}