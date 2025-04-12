import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Utensils, Dumbbell, User } from "lucide-react";

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeColor = "#5ba2fe";
  const inactiveColor = "#888";

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard", exact: true },
    { path: "/diet-tracker", icon: Utensils, label: "Diet" },
    { path: "/workout", icon: Dumbbell, label: "Workout" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const checkIsActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bottom-nav-container nav-container-animation"
    >
      {navItems.map((item) => {
        const isActive = checkIsActive(item);

        return (
          <motion.div
            key={item.path}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive ? 'active' : 'inactive'}`}
          >
            <motion.div
              animate={{
                color: isActive ? activeColor : inactiveColor,
              }}
              transition={{ duration: 0.2 }}
            >
              <item.icon
                className={`nav-icon ${isActive ? 'active' : 'inactive'}`}
                size={16}
              />
            </motion.div>
            <motion.span
              className={`nav-label ${isActive ? 'active' : 'inactive'}`}
            >
              {item.label}
            </motion.span>

            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="active-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BottomNavBar;