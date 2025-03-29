import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; // Import Profile Page
import ProtectedRoute from "./utils/ProtectedRoute";
import DietTrack from "./pages/DietTrack";
import LogDiet from "./pages/LogDiet";
import DietHistory from "./pages/DietHistory";
import Welcome from "./pages/Welcome";
import Workout from "./pages/Workout";
import LiveWorkout from "./pages/LiveWorkout";

const App = () => {
  return (
    <Routes>

      {/* Protected Routes for authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} /> {/* Profile Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/diet-tracker" element={<DietTrack />} />
        <Route path="/log-diet" element={<LogDiet />} />
        <Route path="/diet-history" element={<DietHistory />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/loglive-workout" element={<LiveWorkout />} />


      </Route>
    </Routes>
  );
};

export default App;
