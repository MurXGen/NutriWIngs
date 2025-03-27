import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import { IceCreamBowl, NotepadTextDashed, Upload } from 'lucide-react'


const LogDiet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dietId = queryParams.get("dietId");
  const userId = localStorage.getItem("userId");
  const [isMobileFocused, setIsMobileFocused] = useState(false);

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const [diet, setDiet] = useState({
    foodName: "",
    portionSize: "",
    portionSizeTaken: "",
    carbs: "",
    protein: "",
    fats: "",
    totalCalories: 0,
    date: getCurrentDate(),
    time: getCurrentTime(),
    dietStatus: "Draft",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(!!dietId);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const roundToOneDecimal = (value) => (value ? Math.round(value * 10) / 10 : 0);
  const calculateCalories = (carbs, protein, fats) =>
    roundToOneDecimal(carbs * 4 + protein * 4 + fats * 9);

  useEffect(() => {
    if (dietId) {
      const fetchDiet = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/diet/dietEdit/${dietId}`);
          const fetchedDiet = response.data;

          setDiet({
            foodName: fetchedDiet.FoodName || "",
            portionSize: fetchedDiet.PortionSize || "",
            portionSizeTaken: fetchedDiet.DietTaken?.PortionSizeTaken || "",
            carbs: fetchedDiet.Carbs || "",
            protein: fetchedDiet.Protein || "",
            fats: fetchedDiet.Fats || "",
            totalCalories: calculateCalories(
              fetchedDiet.Carbs || 0,
              fetchedDiet.Protein || 0,
              fetchedDiet.Fats || 0
            ),
            date: fetchedDiet.Date || getCurrentDate(),
            time: fetchedDiet.Time || getCurrentTime(),
            dietStatus: fetchedDiet.DietStatus || "Draft",
            imageUrl: fetchedDiet.ImageUrl || "",
          });

          if (fetchedDiet.ImageUrl) setPreviewImage(fetchedDiet.ImageUrl);
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

      // Recalculate total calories when macros change
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

  // Handle File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compress the image before uploading
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);

      // Show preview
      const imageURL = URL.createObjectURL(compressedFile);
      setPreviewImage(imageURL);
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Image compression failed.");
    }
  };

  // Upload Image to Cloudinary
  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Nutriwings");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhjplff89/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      setError("Image upload failed.");
      return null;
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    // Image is required for saving but not for drafts
    if (status === "Saved" && !imageFile && !diet.imageUrl) {
      setError("Image is required.");
      setLoading(false);
      return;
    }

    // Upload Image if a new one is selected
    let uploadedImageUrl = diet.imageUrl;
    if (imageFile) {
      uploadedImageUrl = await uploadImage();
      if (!uploadedImageUrl) {
        setLoading(false);
        return;
      }
    }

    // Construct diet object
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

    // Validate required fields only when "Save" is clicked
    if (status === "Saved") {
      const requiredFields = ["foodName", "portionSize", "portionSizeTaken", "date", "time"];
      if (requiredFields.some((field) => !diet[field])) {
        setError("All fields are required except for Draft mode.");
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      if (dietId) {
        // Update existing diet
        response = await axios.put(`http://localhost:5000/api/diet/updateDiet/${dietId}`, dietData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // Log new diet entry
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

      {error && <p className="errorText">{error}</p>}

      <form>
        <div className="img_cal_sizeContainer">
          {/* Clickable Image Upload Box */}
          <div className="imgContainer">
            <label htmlFor="fileInput" className="uploadLabel">
              {previewImage ? (
                <img src={previewImage} alt="Uploaded" className="previewImage" />
              ) : (

                <span><Upload />Take Snap of your Meal</span>
              )}
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </div>

          {/* Display Real-time Calories */}
          <div className="cal_sizeContainer">
            <div className="calContainer">
              <span>Total Calories:</span>
              <span>{diet.totalCalories} <strong>kcal</strong></span>
            </div>
            <div className="sizeContainer">
              <input
                type="number"
                name="portionSizeTaken"
                value={diet.portionSizeTaken || ""}
                placeholder="Portion Size Taken (g)"
                onChange={handleChange}
                style={{ marginLeft: '12px', width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="food_inputContainer">

          <span><IceCreamBowl />Food name</span>
          <input
            type="text"
            name="foodName"
            value={diet.foodName || ""}
            placeholder="Food Name"
            onChange={handleChange}
          />
        </div>

        <div className="food_inputContainer">
          <span><NotepadTextDashed />Nutritional Values</span>
          <input
            type="number"
            name="portionSize"
            value={diet.portionSize || ""}
            placeholder="Portion Size (50g) or (100g)"
            onChange={handleChange}
            style={{ width: '100%' }}
          />
          <div className="macrosValue">
            <input
              type="number"
              name="carbs"
              value={diet.carbs || ""}
              placeholder="Carbs (g)"
              step="0.1"
              onChange={handleChange}
            />
            <input
              type="number"
              name="protein"
              value={diet.protein || ""}
              placeholder="Protein (g)"
              step="0.1"
              onChange={handleChange}
            />
            <input
              type="number"
              name="fats"
              value={diet.fats || ""}
              placeholder="Fats (g)"
              step="0.1"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="actionButtons">
          <button type="button" className="toggleButton" onClick={(e) => handleSubmit(e, "Draft")} disabled={loading}>
            {loading ? "Saving Draft..." : "Save as Draft"}
          </button>
          <button type="button" className="toggleButtonLight" onClick={(e) => handleSubmit(e, "Save")} disabled={loading}>
            {loading ? "Submitting..." : "Save"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default LogDiet;
