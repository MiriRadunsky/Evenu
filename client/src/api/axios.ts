import axios from 'axios';

// Base URL של ה-server שלך
const API_URL = 'http://localhost:3000/api'; // שנה את זה לפי הפורט של ה-server שלך

// יצירת instance של axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor להוספת טוקן לכל בקשה
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor לטפל בשגיאות (במיוחד 401 - Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // אם הטוקן פג תוקף, נקה אותו ותעביר להתחברות
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
