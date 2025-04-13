import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import BottomNavBar from '../components/BottomNavBar';
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import axios from 'axios'

const StrengthMetrics = () => {

    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [datesWithData, setDatesWithData] = useState([]);

    const dateScrollRef = useRef(null);


    const userId = localStorage.getItem("userId");

    const fetchStrengthScore = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`http://localhost:5000/api/strength/daily-score/${userId}`);
            const { totalScore, details } = res.data;
            setScore(totalScore);
            setDetails(details);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching strength score", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStrengthScore();
    }, [userId]);

    useEffect(() => {
        if (dateScrollRef.current) {
            const todayElement = dateScrollRef.current.querySelector('.today');
            if (todayElement) {
                todayElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [currentDate]); // Re-run when month changes



    const metrics = [
        { name: 'Protein', score: details?.proteinScore || 0, cap: 20, color: '#FF6B6B', desc: 'Take 1g of your body weight' },
        { name: 'Water', score: details?.waterScore || 0, cap: 10, color: '#4ECDC4', desc: 'Take 3 litres of water' },
        { name: 'Fat', score: details?.fatScore || 0, cap: 5, color: '#FFD166', desc: 'Carbs < 50% of Total Calories' },
        { name: 'Carb', score: details?.carbScore || 0, cap: 10, color: '#06D6A0', desc: 'Fats < 30% of Total Calories' },
        { name: 'Workout Duration', score: details?.durationPoints || 0, cap: 20, color: '#118AB2', desc: 'Workout duration > 60 Mins' },
        { name: 'Consistency Bonus', score: details?.consistencyPoints || 0, cap: 5, color: '#073B4C', desc: 'Last 7 days Consistency Considered' },
        { name: 'Sleep Duration', score: details?.intensityPoints || 0, cap: 7.5, color: '#8338EC', desc: 'Sleep Duration > 8 Hours' },
        { name: 'Failure Intensity', score: details?.failurePoints || 0, cap: 7.5, color: '#FF006E', desc: 'Atleast include four failure sets for each day' },
        { name: 'Action Quality', score: details?.actionPoints || 0, cap: 15, color: '#3A86FF', desc: 'Reps ,Weights and Past Week Performance is considered' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const getDaysInMonth = () => {
        const days = [];
        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            days.push({
                date,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                number: i,
            });
        }
        return days;
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth();

    const fetchStrengthScoreByDate = async (date) => {
        try {
            setIsLoading(true);
            const isoDate = new Date(date).toISOString();
            const res = await axios.get(`http://localhost:5000/api/strength/daily-score/${userId}/${isoDate}`);
            const { totalScore, details } = res.data;
            setScore(totalScore);
            setDetails(details);
        } catch (err) {
            console.error("Error fetching strength score", err);
            setScore(0);
            setDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchStrengthScoreByDate(selectedDate);
        }
    }, [selectedDate, userId]);

    const fetchAllDatesWithData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/strength/dates/${userId}`);
            setDatesWithData(res.data.dates || []);  // Store the dates with data in state
        } catch (err) {
            console.error("Failed to fetch active strength dates", err);
        }
    };

    useEffect(() => {
        if (userId) fetchAllDatesWithData();  // Trigger the fetch when userId changes
    }, [userId]);


    // Check if date has data
    const isDataDate = (date) => {
        return datesWithData.some(d => new Date(d).toDateString() === date.toDateString());
    };


    return (
        <div className="strength-score-container">
            <div className="calendar-section">
                <div className="calendar-header">
                    <button className='toggleButton' onClick={goToPreviousMonth}><ChevronLeft size={24} /></button>
                    <div className="month-year">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button className='toggleButton' onClick={goToNextMonth}><ChevronRight size={24} /></button>
                </div>

                <div className="date-scroll" ref={dateScrollRef}>
                    {daysInMonth.map((d, idx) => {
                        const isToday = new Date().toDateString() === d.date.toDateString();
                        const isSelected = selectedDate.toDateString() === d.date.toDateString();
                        const hasData = isDataDate(d.date);
                        const isPastDate = d.date < new Date() && !isToday;

                        return (
                            <div
                                key={idx}
                                className={`date-box ${isToday ? 'today' : ''}`}
                                onClick={() => setSelectedDate(d.date)}
                                style={{
                                    backgroundColor: isSelected
                                        ? '#5ba2fe'
                                        : hasData && isPastDate
                                            ? '#4CAF50'
                                            : isToday
                                                ? '#5ba2fe20'
                                                : 'transparent',
                                    color: isSelected ? 'white' : 'black',
                                    border: isToday ? '2px solid #5ba2fe' : 'none',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px',
                                    minHeight: '40px'
                                }}
                            >
                                <div className="day" style={{ fontSize: '0.7rem' }}>{d.day}</div>
                                <div className="date" style={{
                                    fontWeight: isToday ? 'bold' : 'normal',
                                    fontSize: isToday ? '1.1rem' : '1rem'
                                }}>
                                    {d.number}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {isLoading ? (
                <div className="loading-spinner">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="spinner"
                    />
                </div>
            ) : (
                <motion.div
                    className="dashboard"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div className="total-score-card" variants={itemVariants}>
                        <h2>Your Strength Score</h2>
                        <div className="total-score">
                            <motion.div
                                className="score-circle"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <div className="score-value">{score}</div>
                                <div className="score-max">/100</div>
                            </motion.div>
                            <svg className="score-circle-bg" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#eee"
                                    strokeWidth="2"
                                />
                                <motion.path
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#3A86FF"
                                    strokeWidth="2"
                                    strokeDasharray="100, 100"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - score }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                        </div>
                    </motion.div>

                    <div className="metrics-grid">
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={metric.name}
                                className="metric-card"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            >
                                <div className="metric-header">
                                    <h3>{metric.name}</h3>
                                    <span className="metric-score">{metric.score.toFixed(1)}/{metric.cap}</span>
                                </div>
                                <div className="progress-bar-container">
                                    <motion.div
                                        className="progress-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(metric.score / metric.cap) * 100}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        style={{ backgroundColor: metric.color }}
                                    />
                                </div>
                                <div className="metric-percentage">
                                    {((metric.score / metric.cap) * 100).toFixed(0)}%
                                </div>
                                <div className='desc'><Info color="#5ba2fe" size="16" /> {metric.desc}</div>
                            </motion.div>

                        ))}

                    </div>
                </motion.div>
            )}

            <BottomNavBar />
        </div>
    )
}

export default StrengthMetrics
