import React from 'react';
import WorkoutHistory from '../components/WorkoutHistory'; // Adjust path if needed
import AuthorNavbar from '../components/AuthorNavbar';
import BottomNavBar from '../components/BottomNavBar';

const WorkoutHistoryPage = () => {
  return (
    <div className="workout-history-page">
      <AuthorNavbar />
      <h2 className="history-header">Workout History</h2>
      <WorkoutHistory />
      <BottomNavBar/>
    </div>
  );
};

export default WorkoutHistoryPage;
