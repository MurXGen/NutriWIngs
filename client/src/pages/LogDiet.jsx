import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LogDiet = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [diet, setDiet] = useState({
    foodName: "",
    portionSize: "",
    portionSizeTaken: "",
    carbs: "",
    protein: "",
    fats: "",
    totalCalories: 0,
    date: "",
    time: "",
    dietStatus: "Draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const calculateCalories = (carbs, protein, fats) => {
    return (carbs * 4 + protein * 4 + fats * 9).toFixed(2);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Convert number inputs to float
    if (["carbs", "protein", "fats"].includes(name)) {
      value = value ? parseFloat(value) : "";
    }

    // Update diet state
    setDiet((prevDiet) => {
      const updatedDiet = { ...prevDiet, [name]: value };

      // Calculate total calories dynamically
      if (["carbs", "protein", "fats"].includes(name)) {
        const carbs = parseFloat(updatedDiet.carbs) || 0;
        const protein = parseFloat(updatedDiet.protein) || 0;
        const fats = parseFloat(updatedDiet.fats) || 0;

        updatedDiet.totalCalories = calculateCalories(carbs, protein, fats);
      }

      return updatedDiet;
    });
  };

  const fetchNutritionData = async () => {
    if (!diet.foodName) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${diet.foodName}&pageSize=10&api_key=RV4ZuqZix53utUnrzVeXDvC8jP6Bz9a43yPIohPC`
      );
      setNutritionData(response.data.foods || []);
    } catch (err) {
      setError("Failed to fetch nutritional data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User not logged in");
      return;
    }

    const dietData = {
      userId,
      ...diet,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/diet/log", dietData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        navigate("/diet-history");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error logging diet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/diet-tracker")}>Back</button>
      <h2>Log Diet</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="foodName" placeholder="Food Name" onChange={handleChange} required />
        <button type="button" onClick={fetchNutritionData} disabled={loading}>
          {loading ? "Fetching..." : "Analyze"}
        </button>
        
        <input type="number" name="portionSize" placeholder="Portion Size (g)" onChange={handleChange} required />
        <input type="number" name="portionSizeTaken" placeholder="Portion Size Taken (g)" onChange={handleChange} required />
        <input type="number" name="carbs" placeholder="Carbs (g)" step="0.01" onChange={handleChange} required />
        <input type="number" name="protein" placeholder="Protein (g)" step="0.01" onChange={handleChange} required />
        <input type="number" name="fats" placeholder="Fats (g)" step="0.01" onChange={handleChange} required />

        {/* Display Total Calories (Readonly) */}
        <input type="text" name="totalCalories" value={diet.totalCalories} readOnly placeholder="Total Calories (kcal)" />

        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="time" onChange={handleChange} required />
        <select name="dietStatus" onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Saved">Saved</option>
          <option value="Quick">Quick</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>

      <h3>Nutrition Results</h3>
      {nutritionData.length > 0 && (
        <ul>
          {nutritionData.slice(0, showMore ? nutritionData.length : 3).map((food, index) => (
            <li key={index}>
              <strong>{food.description}</strong>
              <p>Calories: {food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 'N/A'} kcal</p>
              <p>Protein: {food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 'N/A'} g</p>
              <p>Carbs: {food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 'N/A'} g</p>
              <p>Fats: {food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 'N/A'} g</p>
            </li>
          ))}
        </ul>
      )}

      {nutritionData.length > 3 && !showMore && (
        <button onClick={() => setShowMore(true)}>Show More</button>
      )}
    </div>
  );
};

export default LogDiet;
