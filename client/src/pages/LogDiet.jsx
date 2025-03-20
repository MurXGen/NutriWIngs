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
    date: "",
    time: "",
    dietStatus: "Draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setDiet({ ...diet, [e.target.name]: e.target.value });
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
      userId, // Send userId
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
        <input type="number" name="portionSize" placeholder="Portion Size (g)" onChange={handleChange} required />
        <input type="number" name="portionSizeTaken" placeholder="Portion Size Taken (g)" onChange={handleChange} required />
        <input type="number" name="carbs" placeholder="Carbs (g)" onChange={handleChange} required />
        <input type="number" name="protein" placeholder="Protein (g)" onChange={handleChange} required />
        <input type="number" name="fats" placeholder="Fats (g)" onChange={handleChange} required />
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="time" onChange={handleChange} required />
        <select name="dietStatus" onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Saved">Saved</option>
          <option value="Quick">Quick</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LogDiet;
