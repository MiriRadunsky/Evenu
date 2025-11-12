import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); 
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTAzYzU3MjcxNmRkYWFiYzRiOTdlZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyODcyMjE3LCJleHAiOjE3NjI5NTg2MTd9.yBWjNYRf9ISuOxLs--_SEct57vcXaTjwNvEkkiMDIeI"
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
