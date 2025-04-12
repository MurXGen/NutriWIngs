import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RegisterNavbar from '../components/Navbar';
import { User, HeartPulse } from 'lucide-react';
import BottomNavBar from "../components/BottomNavBar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    lifestyle: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/session", { withCredentials: true });
        setUser(response.data);
        setUpdatedDetails({
          name: response.data.name || "",
          age: response.data.age || "",
          gender: response.data.gender || "",
          weight: response.data.healthDetails.weight || "",
          height: response.data.healthDetails.height || "",
          lifestyle: response.data.healthDetails.lifestyle || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUpdatedDetails({ ...updatedDetails, [e.target.name]: e.target.value });
  };

  const calculateRecomCal = (weight, height, age, gender, lifestyle) => {
    // Harris-Benedict Equation for BMR
    let bmr;
    if (gender === "Male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    // Adjust BMR based on lifestyle
    let recomCal;
    switch (lifestyle) {
      case "Sedentary":
        recomCal = bmr * 1.2;
        break;
      case "Moderately Active":
        recomCal = bmr * 1.55;
        break;
      case "Active":
        recomCal = bmr * 1.9;
        break;
      default:
        recomCal = bmr * 1.2; // Default to sedentary
    }

    // Round off the result to the nearest integer
    return Math.round(recomCal);
  };

  const handleUpdate = async () => {
    try {
      const recomCal = calculateRecomCal(
        updatedDetails.weight,
        updatedDetails.height,
        updatedDetails.age,
        updatedDetails.gender,
        updatedDetails.lifestyle
      );

      console.log("Rounded RecomCal:", recomCal); // Log the rounded value

      const updatePayload = {
        ...updatedDetails,
        healthDetails: {
          weight: updatedDetails.weight,
          height: updatedDetails.height,
          lifestyle: updatedDetails.lifestyle,
          RecomCal: recomCal, // Rounded value
        },
      };

      console.log("Data being sent to the backend:", updatePayload);

      const response = await axios.put(
        `http://localhost:5000/api/diet/update/${user._id}`,
        updatePayload,
        { withCredentials: true }
      );

      console.log("Response from the backend:", response.data);

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      console.log("Logout successful:", response.data); // Log success message
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response ? error.response.data : error.message);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not logged in</p>;

  return (
    <div className="profile">
      <RegisterNavbar />

      <div className="profileDetails">
        <div className="personalHeading">
          <User />
          <span>Personal Details</span>
        </div>

        <label>Name:</label>
        <input type="text" name="name" value={updatedDetails.name} onChange={handleChange} disabled={!isEditing} />

        <label>Age:</label>
        <input type="number" name="age" value={updatedDetails.age} onChange={handleChange} disabled={!isEditing} />

        <label>Gender:</label>
        <select name="gender" value={updatedDetails.gender} onChange={handleChange} disabled={!isEditing}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <div className="personalHeading">
          <HeartPulse />
          <span>Health Details</span>
        </div>
        <label>Weight (kg):</label>
        <input type="number" name="weight" value={updatedDetails.weight} onChange={handleChange} disabled={!isEditing} />

        <label>Height (cm):</label>
        <input type="number" name="height" value={updatedDetails.height} onChange={handleChange} disabled={!isEditing} />

        <label>Lifestyle:</label>
        <select name="lifestyle" value={updatedDetails.lifestyle} onChange={handleChange} disabled={!isEditing}>
          <option value="Sedentary">Sedentary</option>
          <option value="Moderately Active">Moderately Active</option>
          <option value="Active">Active</option>
        </select>

        <div className="twoButtons">
          {isEditing ? (
            <button className="checkButton" onClick={handleUpdate}>Submit</button>
          ) : (
            <button className="checkButton" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button className="checkButton" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <BottomNavBar/>
    </div>
  );
};

export default Profile;