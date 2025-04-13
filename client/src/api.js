import axios from "axios";

const API = axios.create({
  baseURL: "https://nutriwings.onrender.com/api/auth",
  withCredentials: true,
});

export default API;
