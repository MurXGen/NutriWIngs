import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./utils/ProtectedRoute";
import DietTrack from "./pages/DietTrack";
import LogDiet from "./pages/LogDiet";
import DietHistory from "./pages/DietHistory";
import Welcome from "./pages/Welcome";
import Workout from "./pages/Workout";
import LiveWorkout from "./pages/LiveWorkout";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import StrengthMetrics from "./pages/StrengthMetrics";

const App = () => {
  return (
    <Routes>

      {/* Public routes (accessible without auth) */}

      <Route path="/welcome" element={<Welcome />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/diet-tracker" element={<DietTrack />} />
        <Route path="/log-diet" element={<LogDiet />} />
        <Route path="/diet-history" element={<DietHistory />} />

        <Route path="/workout" element={<Workout />} />
        <Route path="/loglive-workout" element={<LiveWorkout />} />
        <Route path="/workout-history" element={<WorkoutHistoryPage />} />
        <Route path="/strength-metrics" element={<StrengthMetrics />} />
      </Route>

    </Routes>
  );
};

export default App;
