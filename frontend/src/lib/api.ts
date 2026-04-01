import axios from "axios";
export const api = axios.create({
  baseURL: "https://ai-powered-school-system-10-7.onrender.com/api",
  withCredentials: true,
});
