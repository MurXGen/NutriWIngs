import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, ChevronLeft, ChevronRight, HeartHandshake } from "lucide-react";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://nutriwings.onrender.com/api/auth/login", {
        mobile,
        password
      }, { withCredentials: true });

      console.log("Login Successful:", response.data);

     
      localStorage.setItem("userId", response.data.userId);

      navigate("/");
    } catch (err) {
      console.error("Login Error:", err.response?.data?.message || "Server error");
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="LoginComponent">
      <div className="boxDesign">

      </div>
      <div className="boxDesign2">

      </div>
      <Navbar />
      <div className="componentHeading" style={{ marginTop: '24px' }}>
        <HeartHandshake />
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Welcome back, Wings....
        </motion.h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form style={{ marginTop: '24px' }} className='inputContainer' onSubmit={handleLogin}>
        {/* Mobile Input */}
        <div className="inputWrapper">
          <AnimatePresence>
            {(isMobileFocused || mobile) && (
              <motion.span
                className="placeholderLabel"
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -20, opacity: 1 }}
                exit={{ y: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Mobile Number
              </motion.span>
            )}
          </AnimatePresence>
          <input
            type="text"
            placeholder={!isMobileFocused && !mobile ? "Mobile Number" : ""}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onFocus={() => setIsMobileFocused(true)}
            onBlur={() => setIsMobileFocused(false)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="inputWrapper">
          <AnimatePresence>
            {(isPasswordFocused || password) && (
              <motion.span
                className="placeholderLabel"
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -20, opacity: 1 }}
                exit={{ y: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                PIN
              </motion.span>
            )}
          </AnimatePresence>
          <input
            type="password"
            placeholder={!isPasswordFocused && !password ? "PIN" : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            required
          />
        </div>

        <div className="actionButtons">
          <button className="proceed" type="submit">
            Proceed <ChevronRight />
          </button>
        </div>
      </form>
      <Link className="loginDirect" to="/register">Create a New Account ? Register ... </Link>
    </div>
  );
};

export default Login;