import React from 'react';
import { useNavigate, Link } from "react-router-dom";

const LoginRedirect = () => {
  return (
    <div>
      <Link className="loginDirect" to="/login">Already have account ? Login... </Link>
    </div>
  )
}

export default LoginRedirect
