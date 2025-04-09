import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkoutTemplates from './pages/WorkoutTemplates';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkoutTemplates />} />
      </Routes>
    </Router>
  );
}

export default App;
