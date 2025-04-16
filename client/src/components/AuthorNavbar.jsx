import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileIcon from '../assets/Profile.svg'
import { User, Settings, LogOut } from "lucide-react";

const AuthorNavbar = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user details
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get("https://nutriwings.onrender.com/api/auth/session", { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user session:", error);
                navigate("/login"); // Redirect to login if user is not authenticated
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await axios.post("https://nutriwings.onrender.com/api/auth/logout", {}, { withCredentials: true });
            console.log("Logout successful:", response.data); // Log success message
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.response ? error.response.data : error.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return null; // Don't render navbar if no user data

    return (
        <div className="authorNavbar">
            <div className="userInfo">
                <button className="profileButton" onClick={() => navigate("/profile")}>
                    <img src={ProfileIcon} alt="" />
                </button>
                <div className="userDetails">
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#5BA2FE' }}>Hey, {user.name || "User"}</span>
                    <div className="desc">
                        <span style={{ fontSize: '14px' }}>{user.age || "Not Given"} ,</span>
                        <span style={{ fontSize: '14px' }}>{user.healthDetails?.lifestyle || "Not Given"}</span>
                    </div>
                </div>
            </div>,
            <div className="navbarActions">
                <button className="logoutButton" onClick={handleLogout}>
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default AuthorNavbar;