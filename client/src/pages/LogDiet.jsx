import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import { IceCreamBowl, NotepadTextDashed, Upload, Info } from 'lucide-react'


const LogDiet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dietId = queryParams.get("dietId");
  const userId = localStorage.getItem("userId");
  const [isMobileFocused, setIsMobileFocused] = useState(false);

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const preselectedDate = location.state?.date;
  const preselectedTime = location.state?.time;

  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);


  const [diet, setDiet] = useState({
    foodName: "",
    portionSize: "",
    portionSizeTaken: "",
    carbs: "",
    protein: "",
    fats: "",
    totalCalories: 0,
    date: preselectedDate || getCurrentDate(),
    time: preselectedTime || getCurrentTime(),
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
          const response = await axios.get(`https://nutriwings.onrender.com/api/diet/dietEdit/${dietId}`);
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

  const fetchFoods = async (query) => {
    if (!query) return;

    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/foods/search`,
        {
          params: {
            query,
            pageSize: 10,
            api_key: "RV4ZuqZix53utUnrzVeXDvC8jP6Bz9a43yPIohPC",
          },
        }
      );

      setFoodSuggestions(response.data.foods || []);
    } catch (error) {
      console.error("USDA API Error:", error);
      setFoodSuggestions([]);
    }
  };


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

 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
     
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);

     
      const imageURL = URL.createObjectURL(compressedFile);
      setPreviewImage(imageURL);
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Image compression failed.");
    }
  };

 
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

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

   
    // if (status === "Draft" && !imageFile && !diet.imageUrl) {
    //   setError("Image is required to save as a draft.");
    //   setLoading(false);
    //   return;
    // }

   
    if (status === "Saved") {
      const requiredFields = ["foodName", "portionSize", "portionSizeTaken", "carbs", "protein", "fats", "date", "time"];
      if (requiredFields.some((field) => !diet[field]?.toString().trim())) {
        setError("To Save, fill in all details");
        setLoading(false);
        return;
      }

     
      // if (!imageFile && !diet.imageUrl) {
      //   setError("Image is required to save the diet.");
      //   setLoading(false);
      //   return;
      // }
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
      carbs: roundToOneDecimal(parseFloat(diet.carbs) || 0),
      protein: roundToOneDecimal(parseFloat(diet.protein) || 0),
      fats: roundToOneDecimal(parseFloat(diet.fats) || 0),
      totalCalories: roundToOneDecimal(diet.totalCalories) || 0,
      date: diet.date || "",
      time: diet.time || "",
      dietStatus: status,
      imageUrl: uploadedImageUrl || "https://res.cloudinary.com/dhjplff89/image/upload/v1744490374/nutriwings-workouts/ymlg21xdmv8ekee0n8cf.png",
    };

    try {
      let response;
      if (dietId) {
        response = await axios.put(`https://nutriwings.onrender.com/api/diet/updateDiet/${dietId}`, dietData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        response = await axios.post("https://nutriwings.onrender.com/api/diet/log", dietData, {
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

  const handleDateChange = (e) => {
    setDiet((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleTimeChange = (e) => {
    setDiet((prev) => ({ ...prev, time: e.target.value }));
  };



  return (
    <div className="logDiet">

      <div className="pageNavigation">
        <button onClick={() => navigate("/diet-tracker")}>{"<"}</button>
        <span>{dietId ? "Edit Diet" : "Log Diet"}</span>
      </div>

      <div className="dateTimeForLog">

        <label>

          <input
            type="date"
            value={diet.date}
            onChange={handleDateChange}
          />
        </label>

        {/* Time Picker */}
        <label>

          <input
            type="time"
            value={diet.time}
            onChange={handleTimeChange}
          />
        </label>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="errorText"
          style={{
            background: "white",
            padding: "12px",
            position: "fixed",
            top: "24px",
            fontSize: "14px",
            display: "flex",
            alignItems: "start",
            gap: "12px",
            color: "red",
            border: "1px solid red",
            borderRadius: "12px",
            width: "80%",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Info />
          {error}
        </motion.div>
      )}

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

          <span><IceCreamBowl color="#5ba2fe" size={16} />Food name</span>
          <input
            type="text"
            name="foodName"
            value={diet.foodName}
            placeholder="Food Name"
            onChange={(e) => {
              const value = e.target.value;
              handleChange(e);

              clearTimeout(searchTimeout);
              const timeout = setTimeout(() => fetchFoods(value), 500);
              setSearchTimeout(timeout);
            }}
            autoComplete="off"
          />

          {foodSuggestions.length > 0 && (
            <ul className="food-suggestions">
              {foodSuggestions.map((item) => (
                <li
                  key={item.fdcId}
                  onClick={() => {
                    const nutrients = item.foodNutrients || [];
                    const getNutrient = (name) => {
                      const nutrient = nutrients.find(n => n.nutrientName.toLowerCase().includes(name));
                      return nutrient ? nutrient.value : 0;
                    };

                    const carbs = getNutrient("carbohydrate");
                    const protein = getNutrient("protein");
                    const fats = getNutrient("total lipid");

                    setDiet(prev => ({
                      ...prev,
                      foodName: item.description,
                      carbs: roundToOneDecimal(carbs),
                      protein: roundToOneDecimal(protein),
                      fats: roundToOneDecimal(fats),
                      totalCalories: calculateCalories(carbs, protein, fats)
                    }));

                    setFoodSuggestions([]);
                  }}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}

        </div>

        <div className="food_inputContainer">
          <span><NotepadTextDashed color="#5ba2fe" size={16} />Nutritional Values</span>
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
          <button type="button" className="toggleButtonLight" onClick={(e) => handleSubmit(e, "Draft")} disabled={loading}>
            {loading ? "Saving Draft..." : "Save as Draft"}
          </button>
          <button type="button" className="toggleButton" onClick={(e) => handleSubmit(e, "Saved")} disabled={loading}>
            {loading ? "Submitting..." : "Save"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default LogDiet;
