import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LazyWorkoutGif = ({ src, alt }) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const gifRef = useRef();
  const loadingTimer = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (gifRef.current) {
      observer.observe(gifRef.current);
    }

    return () => {
      if (gifRef.current) {
        observer.unobserve(gifRef.current);
      }
      clearTimeout(loadingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isInView && !hasLoaded) {
      // Show loading for 1 second before displaying GIF
      loadingTimer.current = setTimeout(() => {
        setHasLoaded(true);
      }, 1000);
    }
  }, [isInView, hasLoaded]);

  return (
    <div ref={gifRef} className="gif-container">
      {!hasLoaded ? (
        <div className="gif-loading-state">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="workout-gif"
          loading="lazy"
        />
      )}
    </div>
  );
};

const WorkoutTemplateSelector = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://nutriwings.onrender.com/api/workouts/templates', {
          credentials: 'include'
        });
        const data = await response.json();
        
        setTemplates(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(data.map(t => t.category))];
        setCategories(uniqueCategories);
        
        setFilteredTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFilteredTemplates(
      category === 'All' ? templates : templates.filter(t => t.category === category)
    );
  };

  const handleSelect = (template) => {
    onSelectTemplate(template);
  };

  return (
    <div className="template-selector">
      {/* Category Filter Buttons */}
      <div className="category-filter">
        {categories.map(category => (
          <motion.button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="loading-message">Loading templates...</div>
      ) : (
        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <motion.div 
              key={template._id}
              className="template-card"
              onClick={() => handleSelect(template)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <LazyWorkoutGif src={template.imageUrl} alt={template.name} />
              <div className="template-info">
                <h4>{template.name}</h4>
                <p className="category-tag">{template.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplateSelector;