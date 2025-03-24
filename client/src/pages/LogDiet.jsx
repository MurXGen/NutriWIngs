import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LogDiet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dietId = queryParams.get("dietId"); // Extract dietId from query params
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

  const roundToOneDecimal = (value) => (value ? Math.round(value * 10) / 10 : 0);

  const calculateCalories = (carbs, protein, fats) => roundToOneDecimal(carbs * 4 + protein * 4 + fats * 9);

  useEffect(() => {
    if (dietId) {
      const fetchDiet = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/diet/${dietId}`);
          console.log("Fetched Diet Data:", response.data); // Debugging
          setDiet(response.data);
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Failed to fetch diet details.");
        } finally {
          setLoading(false);
        }
      };
      fetchDiet();
    }
  }, [dietId]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (["carbs", "protein", "fats"].includes(name)) {
      value = value ? roundToOneDecimal(parseFloat(value)) : "";
    }

    setDiet((prevDiet) => {
      const updatedDiet = { ...prevDiet, [name]: value };

      if (["carbs", "protein", "fats"].includes(name)) {
        updatedDiet.totalCalories = calculateCalories(
          parseFloat(updatedDiet.carbs) || 0,
          parseFloat(updatedDiet.protein) || 0,
          parseFloat(updatedDiet.fats) || 0
        );
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
      foodName: diet.foodName,
      portionSize: diet.portionSize,
      portionSizeTaken: diet.portionSizeTaken,
      carbs: roundToOneDecimal(diet.carbs),
      protein: roundToOneDecimal(diet.protein),
      fats: roundToOneDecimal(diet.fats),
      totalCalories: roundToOneDecimal(diet.totalCalories),
      date: diet.date,
      time: diet.time,
      dietStatus: diet.dietStatus,
    };

    try {
      let response;
      if (dietId) {
        response = await axios.put(`http://localhost:5000/api/diet/${dietId}`, dietData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        response = await axios.post("http://localhost:5000/api/diet/log", dietData, {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (response.status === 200 || response.status === 201) {
        navigate("/diet-history");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error logging diet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logDiet">

      <div className="pageNavigation">

        <button onClick={() => navigate("/diet-tracker")}>{"<"}</button>
        <span>{dietId ? "Edit Diet" : "Log Diet"}</span>


      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>

        <div className="foodName">
          <div className="Name">
            <input type="text" name="foodName" value={diet.foodName || ""} placeholder="Food Name" onChange={handleChange} required />
            <button type="button" onClick={fetchNutritionData} disabled={loading}>
              {loading ? "Fetching..." : "Analyze"}
            </button>
          </div>
          <div className="nutrionalResults">

            {nutritionData.length > 0 && (
              <div className="nutrionalBox">
                {nutritionData.slice(0, showMore ? nutritionData.length : 3).map((food, index) => (
                  <div key={index}>
                    <div className="foodTitle">
                      <strong>{food.description}</strong>
                      <span>{food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 'N/A'} kcal</span>
                    </div>
                    <div className="foodMacros">
                      <span><span style={{ width: '10px', background: '#FFE500', height: '10px', borderRadius: '12px' }}></span> {food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 'N/A'} g</span>
                      <span><span style={{ width: '10px', background: '#00FF09', height: '10px', borderRadius: '12px' }}></span> {food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 'N/A'} g</span>
                      <span><span style={{ width: '10px', background: '#FF8192', height: '10px', borderRadius: '12px' }}></span> {food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 'N/A'} g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {nutritionData.length > 3 && !showMore && (
              <button className="toggleButton" onClick={() => setShowMore(true)}>Show More</button>
            )}

          </div>


        <input type="number" name="portionSize" value={diet.portionSize || ""} placeholder="Portion Size (g)" onChange={handleChange} required />
        <input type="number" name="portionSizeTaken" value={diet.portionSizeTaken || ""} placeholder="Portion Size Taken (g)" onChange={handleChange} required />
        <input type="number" name="carbs" value={diet.carbs || ""} placeholder="Carbs (g)" step="0.1" onChange={handleChange} required />
        <input type="number" name="protein" value={diet.protein || ""} placeholder="Protein (g)" step="0.1" onChange={handleChange} required />
        <input type="number" name="fats" value={diet.fats || ""} placeholder="Fats (g)" step="0.1" onChange={handleChange} required />

        <input type="text" name="totalCalories" value={diet.totalCalories || 0} readOnly placeholder="Total Calories (kcal)" />

        <input type="date" name="date" value={diet.date ? diet.date.split("T")[0] : ""} onChange={handleChange} required />
        <input type="time" name="time" value={diet.time || ""} onChange={handleChange} required />
        <select name="dietStatus" value={diet.dietStatus} onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Saved">Saved</option>
          <option value="Quick">Quick</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
                  
        </div>
      </form>

    </div>
  );
};

export default LogDiet;
