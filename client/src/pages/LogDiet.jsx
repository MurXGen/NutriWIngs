import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LogDiet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dietId = queryParams.get("dietId");
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
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const roundToOneDecimal = (value) => (value ? Math.round(value * 10) / 10 : 0);
  const calculateCalories = (carbs, protein, fats) => roundToOneDecimal(carbs * 4 + protein * 4 + fats * 9);

  useEffect(() => {
    if (dietId) {
      const fetchDiet = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/diet/${dietId}`);
          setDiet(response.data);
        } catch (err) {
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

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Nutriwings");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dhjplff89/image/upload", formData);
      return response.data.secure_url;
    } catch (err) {
      setError("Image upload failed.");
      return null;
    }
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    if (!imageFile && !diet.imageUrl) {
      setError("Image is required.");
      setLoading(false);
      return;
    }

    let uploadedImageUrl = diet.imageUrl;
    if (imageFile) {
      uploadedImageUrl = await uploadImage();
      if (!uploadedImageUrl) {
        setLoading(false);
        return;
      }
    }

    const dietData = {
      userId,
      foodName: diet.foodName || "",
      portionSize: diet.portionSize || "",
      portionSizeTaken: diet.portionSizeTaken || "",
      carbs: roundToOneDecimal(diet.carbs) || "",
      protein: roundToOneDecimal(diet.protein) || "",
      fats: roundToOneDecimal(diet.fats) || "",
      totalCalories: roundToOneDecimal(diet.totalCalories) || "",
      date: diet.date || "",
      time: diet.time || "",
      dietStatus: status,
      imageUrl: uploadedImageUrl,
    };

    // Validation only for "Save", not for "Draft"
    if (status === "Saved") {
      if (!diet.foodName || !diet.portionSize || !diet.portionSizeTaken || !diet.date || !diet.time) {
        setError("All fields are required except for Draft mode.");
        setLoading(false);
        return;
      }
    }

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

      <form>
        <input type="text" name="foodName" value={diet.foodName || ""} placeholder="Food Name" onChange={handleChange} />
        <input type="number" name="portionSize" value={diet.portionSize || ""} placeholder="Portion Size (g)" onChange={handleChange} />
        <input type="number" name="portionSizeTaken" value={diet.portionSizeTaken || ""} placeholder="Portion Size Taken (g)" onChange={handleChange} />
        <input type="number" name="carbs" value={diet.carbs || ""} placeholder="Carbs (g)" step="0.1" onChange={handleChange} />
        <input type="number" name="protein" value={diet.protein || ""} placeholder="Protein (g)" step="0.1" onChange={handleChange} />
        <input type="number" name="fats" value={diet.fats || ""} placeholder="Fats (g)" step="0.1" onChange={handleChange} />
        <input type="date" name="date" value={diet.date ? diet.date.split("T")[0] : ""} onChange={handleChange} />
        <input type="time" name="time" value={diet.time || ""} onChange={handleChange} />

        <input type="file" accept="image/*" onChange={handleFileChange} />
        {diet.imageUrl && <img src={diet.imageUrl} alt="Diet Image" width="100" />}

        <button type="button" onClick={(e) => handleSubmit(e, "Draft")} disabled={loading}>
          {loading ? "Saving Draft..." : "Save as Draft"}
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, "Save")} disabled={loading}>
          {loading ? "Submitting..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default LogDiet;
